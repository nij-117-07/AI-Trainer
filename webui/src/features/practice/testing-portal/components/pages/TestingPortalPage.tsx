// src/features/practice/testing-portal/components/pages/TestingPortalPage.tsx
/**
 * Testing Portal page: five tabbed generators — MCQs, Theoretical questions,
 * Expert answers, MCQ solving, and a custom Performance Grader. Each tab keeps
 * its own persisted draft and result.
 */
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraderPage } from "@/features/practice/grader/components/pages/GraderPage";
import { McqForm } from "../forms/McqForm";
import { TheoreticalForm } from "../forms/TheoreticalForm";
import { AnswerForm } from "../forms/AnswerForm";
import { SolverForm } from "../forms/SolverForm";

export function TestingPortalPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <Tabs defaultValue="mcq" className="w-full">
        <TabsList className="w-full flex-wrap">
          <TabsTrigger value="mcq">MCQs</TabsTrigger>
          <TabsTrigger value="theoretical">Theoretical</TabsTrigger>
          <TabsTrigger value="answer">Expert Answer</TabsTrigger>
          <TabsTrigger value="solver">Solve an MCQ</TabsTrigger>
          <TabsTrigger value="grader">Grader</TabsTrigger>
        </TabsList>
        <TabsContent value="mcq" className="pt-4">
          <McqForm />
        </TabsContent>
        <TabsContent value="theoretical" className="pt-4">
          <TheoreticalForm />
        </TabsContent>
        <TabsContent value="answer" className="pt-4">
          <AnswerForm />
        </TabsContent>
        <TabsContent value="solver" className="pt-4">
          <SolverForm />
        </TabsContent>
        <TabsContent value="grader" className="pt-4">
          <GraderPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
