"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@iconify/react/dist/iconify.js";

export function DraftManagerVisitor() {
  return (
    <Card className="mb-4 dark:bg-c1/30 bg-muted">
      <CardContent>
        <div className="flex items-start gap-2">
          <Icon
            icon="ri:information-line"
            className="w-6 h-6 min-h-6 min-w-6"
            width="24"
            height="24"
          />
          <div className="flex flex-col gap-1">
            <span className="mb-2 font-semibold">
              BEACON 2025 Attendance Info:
            </span>
            <ul className="list-disc lg:pl-4">
              <li className="ml-4">Sept 29 (Day 1)</li>
              <li className="ml-4">Sept 30 (Day 2)</li>
              <li className="ml-4">Oct 1 (Day 3)</li>
            </ul>

            <span className="mt-4 mb-2 font-semibold">BEACON 2025 events</span>
            <ul className="list-disc lg:pl-4">
              <li className="ml-4">EXPO</li>
              <li className="ml-4">CONFERENCE</li>
              <li className="ml-4">PHILIPPINE IN-WATER SHIP &amp; BOAT SHOW</li>
              <li className="ml-4">BLUE RUNWAY</li>
              <li className="ml-4">NETWORKING &amp; AWARDS NIGHT</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
