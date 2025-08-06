
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BrainCircuit, LayoutDashboard, Briefcase } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-[calc(100vh-57px)] overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-0 h-full w-full bg-background" />
            <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(0,122,255,.15),rgba(255,255,255,0))]" />
            <div className="absolute bottom-[-20%] right-0 top-[-10%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(0,122,255,.15),rgba(255,255,255,0))]" />
        </div>
      <main className="flex-1 z-10">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-transparent">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_550px] lg:gap-12 xl:grid-cols-[1fr_650px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                    Unlock Your Potential with ConsultantFlow
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    The intelligent platform for managing, tracking, and deploying top-tier consulting talent. Powered by AI to streamline your workflow.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/login">
                      Consultant Login
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/admin/login">
                      Admin Access
                    </Link>
                  </Button>
                </div>
              </div>
              <Image
                src="/homepg_pic.jpg"
                width="650"
                height="400"
                alt="Hero"
                data-ai-hint="management dashboard"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-card/60 backdrop-blur-xl border-t border-b border-border/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Why Choose ConsultantFlow?</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform provides the tools you need to excel. From AI-driven analysis to seamless opportunity matching, we've got you covered.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
              <div className="grid gap-1 text-center">
                 <div className="flex justify-center items-center mb-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                        <BrainCircuit className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <h3 className="text-lg font-bold">AI-Powered Insights</h3>
                <p className="text-sm text-muted-foreground">
                    Automatically analyze resumes and certificates to extract skills, rate proficiency, and provide actionable feedback.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                 <div className="flex justify-center items-center mb-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                        <LayoutDashboard className="w-8 h-8 text-primary" />
                    </div>
                 </div>
                <h3 className="text-lg font-bold">Unified Dashboards</h3>
                <p className="text-sm text-muted-foreground">
                  Centralized consoles for both consultants and administrators to track progress, manage data, and view reports.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                 <div className="flex justify-center items-center mb-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                        <Briefcase className="w-8 h-8 text-primary" />
                    </div>
                 </div>
                <h3 className="text-lg font-bold">Intelligent Matching</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI agent suggests the most relevant project opportunities based on a consultant's verified skill set.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-transparent">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to Join the Flow?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Create your consultant profile today and let our AI-powered platform help you find your next opportunity.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
               <Button asChild size="lg" className="w-full">
                <Link href="/signup">
                  Sign Up Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
