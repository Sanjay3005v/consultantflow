
import Link from "next/link";
import { ArrowRight, User, Shield, UserPlus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16 sm:py-24 lg:py-32">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl">
          Welcome to ConsultantFlow
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
          Streamlining the management of consultants by automating the collection and reporting of essential data.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center gap-4">
              <User className="w-8 h-8 text-accent" />
              <CardTitle className="text-2xl">Consultant Login</CardTitle>
            </div>
            <CardDescription className="pt-2">
              Access your personal dashboard, update your resume, and track your progress.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/login">
                Login to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center gap-4">
               <Shield className="w-8 h-8 text-accent" />
               <CardTitle className="text-2xl">Admin Console</CardTitle>
            </div>
            <CardDescription className="pt-2">
              Manage consultants, search and filter profiles, and generate reports.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/login">
                Go to Console <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center gap-4">
               <UserPlus className="w-8 h-8 text-accent" />
               <CardTitle className="text-2xl">New Consultant?</CardTitle>
            </div>
            <CardDescription className="pt-2">
              Create a new consultant profile to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/signup">
                Sign Up Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center gap-4">
               <MessageCircle className="w-8 h-8 text-accent" />
               <CardTitle className="text-2xl">Apply Now</CardTitle>
            </div>
            <CardDescription className="pt-2">
              Use our AI chatbot to submit your application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/chatbot">
                Start Chat <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
