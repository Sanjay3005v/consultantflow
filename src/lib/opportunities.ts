
import type { JobOpportunity } from './types';

// In a real application, this data would likely come from a database.
const jobOpportunities: JobOpportunity[] = [
    {
        id: 'fe-engineer',
        title: 'Senior Frontend Engineer',
        neededSkills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
        neededYOE: 5,
        responsibilities: 'Lead the development of user-facing features, build reusable components, and optimize applications for maximum speed and scalability.',
    },
    {
        id: 'be-engineer',
        title: 'Backend Engineer',
        neededSkills: ['Node.js', 'Express', 'SQL', 'Docker', 'Go'],
        neededYOE: 4,
        responsibilities: 'Design and maintain server-side logic, define and maintain the central database, and ensure high performance and responsiveness to requests from the front-end.',
    },
    {
        id: 'cyber-analyst',
        title: 'Cybersecurity Analyst',
        neededSkills: ['Cybersecurity', 'SIEM', 'Firewalls', 'Penetration Testing'],
        neededYOE: 3,
        responsibilities: 'Monitor security alerts, conduct vulnerability assessments, and respond to security incidents to protect company assets.',
    },
    {
        id: 'devops-engineer',
        title: 'DevOps Engineer',
        neededSkills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD'],
        neededYOE: 4,
        responsibilities: 'Manage and improve the CI/CD pipeline, automate infrastructure provisioning, and ensure the reliability and scalability of our systems.',
    },
    {
        id: 'cloud-dev',
        title: 'Cloud Developer',
        neededSkills: ['AWS', 'GCP', 'Serverless', 'Microservices'],
        neededYOE: 3,
        responsibilities: 'Develop and deploy cloud-native applications, leverage serverless architecture, and manage cloud infrastructure.',
    },
    {
        id: 'ui-ux-designer',
        title: 'UI/UX Designer',
        neededSkills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
        neededYOE: 3,
        responsibilities: 'Create user-centered designs by understanding business requirements, and user feedback. Design user flows, wireframes, prototypes, and mockups.',
    },
    {
        id: 'data-scientist',
        title: 'Data Scientist',
        neededSkills: ['Python', 'Machine Learning', 'SQL', 'Data Visualization'],
        neededYOE: 5,
        responsibilities: 'Analyze large, complex datasets to extract valuable insights, build predictive models, and support data-driven decision-making.',
    },
    {
        id: 'ml-engineer',
        title: 'Machine Learning Engineer',
        neededSkills: ['Python', 'TensorFlow', 'PyTorch', 'MLOps'],
        neededYOE: 4,
        responsibilities: 'Design, build, and deploy machine learning models. Manage the end-to-end ML lifecycle, including data pipelines and model deployment.',
    },
    {
        id: 'product-manager',
        title: 'Product Manager',
        neededSkills: ['Agile', 'Roadmapping', 'User Stories', 'Market Research'],
        neededYOE: 6,
        responsibilities: 'Define product vision, strategy, and roadmap. Work with cross-functional teams to plan, build, and launch products.',
    },
    {
        id: 'qa-engineer',
        title: 'QA Automation Engineer',
        neededSkills: ['Selenium', 'Cypress', 'JavaScript', 'CI/CD'],
        neededYOE: 3,
        responsibilities: 'Develop and maintain automated test scripts to ensure product quality. Integrate automated tests into the CI/CD pipeline.',
    },
    {
        id: 'full-stack-dev',
        title: 'Full Stack Developer',
        neededSkills: ['React', 'Node.js', 'SQL', 'REST APIs', 'TypeScript'],
        neededYOE: 3,
        responsibilities: 'Work on both the frontend and backend of our applications. Develop new features, fix bugs, and contribute to all phases of the development lifecycle.',
    },
    {
        id: 'mobile-dev',
        title: 'Mobile App Developer',
        neededSkills: ['React Native', 'Swift', 'Kotlin', 'Firebase'],
        neededYOE: 3,
        responsibilities: 'Develop and maintain our mobile applications for iOS and Android. Work with product and design teams to build new features.',
    },
    {
        id: 'solutions-arch',
        title: 'Solutions Architect',
        neededSkills: ['System Design', 'Microservices', 'AWS', 'GCP'],
        neededYOE: 8,
        responsibilities: 'Design and document complex software systems. Provide technical leadership to development teams and ensure solutions are scalable and secure.',
    },
    {
        id: 'it-pm',
        title: 'IT Project Manager',
        neededSkills: ['Agile', 'Scrum', 'JIRA', 'Budgeting'],
        neededYOE: 5,
        responsibilities: 'Plan, execute, and finalize IT projects according to strict deadlines and within budget. This includes acquiring resources and coordinating the efforts of team members.',
    },
    {
        id: 'dba',
        title: 'Database Administrator',
        neededSkills: ['SQL', 'PostgreSQL', 'Database Tuning', 'Backup & Recovery'],
        neededYOE: 4,
        responsibilities: 'Manage and maintain company databases. Ensure data integrity, performance, and security. Implement backup and recovery plans.',
    },
];

export async function getJobOpportunities(): Promise<JobOpportunity[]> {
    // Simulate a database call
    return Promise.resolve(jobOpportunities);
}
