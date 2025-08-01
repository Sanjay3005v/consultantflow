
import { db } from './firebase';
import { collection, doc, addDoc, getDoc, getDocs, query, where, updateDoc, writeBatch } from 'firebase/firestore';
import type { Consultant, SkillAnalysis, AttendanceRecord, JobOpportunity } from './types';
import { v4 as uuidv4 } from 'uuid';

// Helper to map Firestore doc to the Consultant type
const mapDocToConsultant = (doc: any): Consultant => {
    const data = doc.data();
    return {
        id: doc.id,
        name: data.name,
        email: data.email,
        password: data.password,
        department: data.department,
        status: data.status,
        resumeStatus: data.resumeStatus,
        opportunities: data.opportunities,
        training: data.training,
        totalWorkingDays: data.totalWorkingDays || 22,
        selectedOpportunities: data.selectedOpportunities || [],
        // Subcollections for skills and attendance are handled separately
        skills: data.skills || [],
        attendance: data.attendance || [],
        workflow: data.workflow || {
            resumeUpdated: false,
            attendanceReported: false,
            opportunitiesDocumented: false,
            trainingCompleted: false,
        },
    };
};

export const getConsultantById = async (id: string): Promise<Consultant | undefined> => {
    const consultantDocRef = doc(db, 'consultants', id);
    const consultantDocSnap = await getDoc(consultantDocRef);

    if (!consultantDocSnap.exists()) {
        return undefined;
    }

    const consultant = mapDocToConsultant(consultantDocSnap);
    
    const skillsQuery = query(collection(db, `consultants/${id}/skills`));
    const skillsSnapshot = await getDocs(skillsQuery);
    if (!skillsSnapshot.empty) {
         // Filter out placeholder document
         consultant.skills = skillsSnapshot.docs
            .map(d => d.data() as SkillAnalysis)
            .filter(d => d && d.skill);
    }

    const attendanceQuery = query(collection(db, `consultants/${id}/attendance`));
    const attendanceSnapshot = await getDocs(attendanceQuery);
    if(!attendanceSnapshot.empty) {
         // Filter out placeholder document
        consultant.attendance = attendanceSnapshot.docs
            .map(d => d.data() as AttendanceRecord)
            .filter(d => d && d.date);
    }
    
    return consultant;
};

export const getAllConsultants = async (): Promise<Consultant[]> => {
    const consultantsCol = collection(db, 'consultants');
    const consultantSnapshot = await getDocs(consultantsCol);
    const consultants: Consultant[] = [];
    for (const docSnap of consultantSnapshot.docs) {
        const consultant = await getConsultantById(docSnap.id);
        if (consultant) {
            consultants.push(consultant);
        }
    }
    return consultants;
};

export const findConsultantByEmail = async (email: string): Promise<Consultant | undefined> => {
    const q = query(collection(db, 'consultants'), where("email", "==", email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        return undefined;
    }

    const consultantDoc = querySnapshot.docs[0];
    return await getConsultantById(consultantDoc.id);
};

export const updateConsultantAttendanceInDb = async (id: string, date: string, status: 'Present' | 'Absent'): Promise<Consultant | undefined> => {
    const attendanceCol = collection(db, `consultants/${id}/attendance`);
    const q = query(attendanceCol, where("date", "==", date));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, { status });
    } else {
        await addDoc(attendanceCol, { date, status });
    }
    
    return getConsultantById(id);
};


export const updateConsultantSkillsInDb = async (consultantId: string, newSkills: SkillAnalysis[]): Promise<Consultant | undefined> => {
    const skillsColRef = collection(db, `consultants/${consultantId}/skills`);
    
    const existingSkillsSnapshot = await getDocs(skillsColRef);
    const batch = writeBatch(db);
    existingSkillsSnapshot.docs.forEach(doc => {
        // Keep placeholder document if it exists, delete others
        if (!doc.data().hasOwnProperty('placeholder')) {
            batch.delete(doc.ref);
        }
    });
    
    newSkills.forEach(skill => {
        const newSkillRef = doc(skillsColRef);
        batch.set(newSkillRef, skill);
    });

    await batch.commit();

    const consultantDocRef = doc(db, 'consultants', consultantId);
    await updateDoc(consultantDocRef, {
        resumeStatus: 'Updated',
        'workflow.resumeUpdated': true
    });

    return getConsultantById(consultantId);
};

export const addSkillToConsultantInDb = async (consultantId: string, newSkill: SkillAnalysis): Promise<Consultant | undefined> => {
    const skillsColRef = collection(db, `consultants/${consultantId}/skills`);
    await addDoc(skillsColRef, newSkill);
    
    const consultantDocRef = doc(db, 'consultants', consultantId);
    await updateDoc(consultantDocRef, {
        training: 'Completed',
        'workflow.trainingCompleted': true
    });
    
    return getConsultantById(consultantId);
};


export const createConsultant = async (data: { name: string; email: string; password: string; department: 'Technology' | 'Healthcare' | 'Finance' | 'Retail' }): Promise<Consultant> => {
    const newConsultantData = {
        name: data.name,
        email: data.email.toLowerCase(),
        password: data.password, // Ensure password is saved
        department: data.department,
        status: 'On Bench' as const,
        resumeStatus: 'Pending' as const,
        opportunities: 0,
        training: 'Not Started' as const,
        totalWorkingDays: 22,
        selectedOpportunities: [],
        workflow: {
            resumeUpdated: false,
            attendanceReported: false,
            opportunitiesDocumented: false,
            trainingCompleted: false,
        },
    };

    const docRef = await addDoc(collection(db, 'consultants'), newConsultantData);

    // Initialize subcollections with a placeholder document
    const skillsColRef = collection(db, `consultants/${docRef.id}/skills`);
    await addDoc(skillsColRef, { placeholder: true });

    const attendanceColRef = collection(db, `consultants/${docRef.id}/attendance`);
    await addDoc(attendanceColRef, { placeholder: true });


    const newConsultant = await getConsultantById(docRef.id);
    if (!newConsultant) {
        throw new Error("Failed to retrieve newly created consultant.");
    }
    
    return newConsultant;
};

export const getJobOpportunities = async (): Promise<JobOpportunity[]> => {
    const opportunitiesCol = collection(db, 'opportunities');
    const opportunitySnapshot = await getDocs(opportunitiesCol);
    const opportunities: JobOpportunity[] = opportunitySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            title: data.title,
            neededSkills: data.neededSkills,
            neededYOE: data.neededYOE,
            responsibilities: data.responsibilities,
        }
    });
    return opportunities;
};


export const updateConsultantOpportunitiesInDb = async (consultantId: string, opportunityIds: string[]): Promise<Consultant | undefined> => {
    const consultantDocRef = doc(db, 'consultants', consultantId);
    await updateDoc(consultantDocRef, {
        selectedOpportunities: opportunityIds,
    });
    return getConsultantById(consultantId);
};
