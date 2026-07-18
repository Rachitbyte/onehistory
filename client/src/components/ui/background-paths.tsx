"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function BackgroundPaths({
    title = "Background Paths",
}: {
    title?: string;
}) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-6">
            <div className="mx-auto max-w-3xl text-center">
                <div className="mb-6 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                    OneHistory
                </div>
                <h1 className="mb-6 text-5xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-6xl">
                    {title}
                </h1>
                <p className="mx-auto mb-8 max-w-xl text-base leading-7 text-slate-500">
                    A quiet, focused surface for secure health records and patient-controlled access.
                </p>
                <Button className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700">
                    Discover Excellence
                    <ArrowRight className="ml-2" size={18} />
                </Button>
            </div>
        </div>
    );
}
