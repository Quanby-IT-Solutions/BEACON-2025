"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  FileWarning,
  MessageCircleWarning,
  MessageCircleWarningIcon,
} from "lucide-react";

export function DraftManager() {
  return (
    <Card className="mb-4 bg-muted">
      <CardContent>
        <div className="flex items-start gap-2">
          <Icon
            icon="ri:information-line"
            className="w-6 h-6 min-h-6 min-w-6"
            width="24"
            height="24"
          />
          <div className="flex flex-col gap-1">
            <span className="mb-2 font-semibold">Registration Fees:</span>
            <ul className="list-disc lg:pl-4">
              <li className="ml-4">
                Conference: ₱3,000/day or ₱7,500 for 3 days (includes AM snack,
                lunch, PM snack, certificate of participation)
              </li>
              <li className="ml-4">
                Blue Runway Fashion Show: ₱2,000 (includes Dinner and free photo
                souvenir)
              </li>
              <li className="ml-4">
                In-Water Boat Show: FREE, but registration is required for entry
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
