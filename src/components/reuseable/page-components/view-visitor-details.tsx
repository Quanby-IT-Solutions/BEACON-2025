import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  ExternalLink,
  User,
  Phone,
  Building,
  Heart,
  Calendar,
  Shield,
  ZoomIn,
  UserCheck,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { VisitorData } from "@/components/admin/visitors-data-table";

interface VisitorRegistrationDialogProps {
  visitor: VisitorData;
  getStatusBadge: (status: string) => React.ReactNode;
}

// Utility Components
const InfoField: React.FC<{
  label: string;
  value: string | number | null | undefined;
  fallback?: string;
  className?: string;
  copyable?: boolean;
}> = ({ label, value, fallback = "N/A", className = "", copyable = false }) => (
  <div className={`space-y-2 ${className}`}>
    <label className="text-sm font-semibold uppercase tracking-wide">
      {label}
    </label>
    <div className="flex items-center gap-2">
      <p className="text-base font-medium">{value || fallback}</p>
      {copyable && value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigator.clipboard.writeText(String(value))}
          className="h-6 w-6 p-0 hover:bg-border"
        >
          <Eye className="h-3 w-3" />
        </Button>
      )}
    </div>
  </div>
);

const SectionCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, icon, children, className = "" }) => (
  <Card className={`border-0 shadow-sm dark:bg-c1/30 bg-muted ${className}`}>
    <CardHeader className="pb-4 border-b border-border">
      <CardTitle className="text-lg font-bold flex items-center gap-3">
        <div className="p-2 dark:bg-c1/30 rounded-lg text-blue-600">{icon}</div>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-6">{children}</CardContent>
  </Card>
);

// Image Modal Component
const ImageModal: React.FC<{
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}> = ({ src, alt, isOpen, onClose }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-4xl max-h-[90vh] p-2">
      <DialogHeader>
        <DialogTitle>{alt}</DialogTitle>
      </DialogHeader>
      <div className="flex justify-center">
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
        />
      </div>
    </DialogContent>
  </Dialog>
);

// Section Components
const PersonalInfoSection: React.FC<{
  personalInfo: VisitorData["personalInfo"];
}> = ({ personalInfo }) => {
  const [showFaceModal, setShowFaceModal] = useState(false);

  const fullName = [
    personalInfo.firstName,
    personalInfo.middleName,
    personalInfo.lastName,
    personalInfo.suffix,
  ]
    .filter(Boolean)
    .join(" ");

  const genderDisplay = personalInfo.genderOthers
    ? `${personalInfo.gender} (${personalInfo.genderOthers})`
    : personalInfo.gender;

  return (
    <SectionCard
      title="Personal Information"
      icon={<User className="h-5 w-5" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Face Photo Section */}
        {personalInfo.faceScannedUrl && (
          <div className="lg:col-span-3 mb-4">
            <label className="text-sm font-semibold uppercase tracking-wide mb-3 block">
              Face Photo
            </label>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <img
                  className="w-32 h-32 object-cover rounded-xl shadow-md border cursor-pointer hover:shadow-lg transition-shadow"
                  src={personalInfo.faceScannedUrl}
                  alt="Face Photo"
                  onClick={() => setShowFaceModal(true)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFaceModal(true)}
                  className="flex items-center gap-2 w-fit"
                >
                  <ZoomIn className="h-4 w-4" />
                  View Full Size
                </Button>
                <Link
                  href={personalInfo.faceScannedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium w-fit"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </Link>
              </div>
            </div>

            <ImageModal
              src={personalInfo.faceScannedUrl}
              alt="Face Photo"
              isOpen={showFaceModal}
              onClose={() => setShowFaceModal(false)}
            />
          </div>
        )}

        <InfoField
          label="Full Name"
          value={fullName}
          className="lg:col-span-2"
        />
        <InfoField label="Preferred Name" value={personalInfo.preferredName} />
        <InfoField label="Gender" value={genderDisplay} />
        <InfoField label="Age Bracket" value={personalInfo.ageBracket} />
        <InfoField label="Nationality" value={personalInfo.nationality} />
      </div>
    </SectionCard>
  );
};

const ContactInfoSection: React.FC<{
  contactInfo: VisitorData["contactInfo"];
  getStatusBadge: (status: string) => React.ReactNode;
}> = ({ contactInfo, getStatusBadge }) => (
  <SectionCard title="Contact Information" icon={<Phone className="h-5 w-5" />}>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <InfoField label="Email Address" value={contactInfo.email} copyable />
      <InfoField
        label="Mobile Number"
        value={contactInfo.mobileNumber}
        copyable
      />
      <InfoField label="Landline" value={contactInfo.landline} />
      <InfoField
        label="Mailing Address"
        value={contactInfo.mailingAddress}
        className="lg:col-span-2"
      />
      <div className="space-y-2">
        <label className="text-sm font-semibold uppercase tracking-wide">
          Status
        </label>
        <div>{getStatusBadge(contactInfo.status)}</div>
      </div>
    </div>
  </SectionCard>
);

const ProfessionalInfoSection: React.FC<{
  professionalInfo: VisitorData["professionalInfo"];
}> = ({ professionalInfo }) => {
  const industryDisplay = professionalInfo.industryOthers
    ? `${professionalInfo.industry} (${professionalInfo.industryOthers})`
    : professionalInfo.industry;

  return (
    <SectionCard
      title="Professional Information"
      icon={<Building className="h-5 w-5" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoField label="Job Title" value={professionalInfo.jobTitle} />
        <InfoField label="Company Name" value={professionalInfo.companyName} />
        <InfoField label="Industry" value={industryDisplay} />
        <InfoField
          label="Business Email"
          value={professionalInfo.businessEmail}
          copyable
        />
        <InfoField
          label="Company Address"
          value={professionalInfo.companyAddress}
        />
        <InfoField
          label="Company Website"
          value={professionalInfo.companyWebsite}
        />
      </div>
    </SectionCard>
  );
};

const EventInfoSection: React.FC<{
  eventInfo: VisitorData["eventInfo"];
}> = ({ eventInfo }) => (
  <SectionCard
    title="Event Information"
    icon={<Calendar className="h-5 w-5" />}
  >
    <div className="space-y-6">
      {/* Attending Days */}
      <div>
        <label className="text-sm font-semibold uppercase tracking-wide mb-3 block">
          Attending Days
        </label>
        <div className="flex flex-wrap gap-2">
          {eventInfo.attendingDays.length > 0 ? (
            eventInfo.attendingDays.map((day, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1 text-sm font-medium"
              >
                {day}
              </Badge>
            ))
          ) : (
            <span className="text-slate-500 italic">None specified</span>
          )}
        </div>
      </div>

      {/* Event Parts */}
      <div>
        <label className="text-sm font-semibold uppercase tracking-wide mb-3 block">
          Event Parts
        </label>
        <div className="flex flex-wrap gap-2">
          {eventInfo.eventParts.length > 0 ? (
            eventInfo.eventParts.map((part, index) => (
              <Badge
                key={index}
                variant="outline"
                className="px-3 py-1 text-sm font-medium"
              >
                {part}
              </Badge>
            ))
          ) : (
            <span className="text-slate-500 italic">None specified</span>
          )}
        </div>
      </div>

      {/* Attendee Type */}
      <InfoField label="Attendee Type" value={eventInfo.attendeeType} />

      {/* Interest Areas */}
      <div>
        <label className="text-sm font-semibold uppercase tracking-wide mb-3 block">
          Interest Areas
        </label>
        <div className="flex flex-wrap gap-2">
          {eventInfo.interestAreas.length > 0 ? (
            eventInfo.interestAreas.map((interest, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 text-sm font-medium"
              >
                {interest
                  .replace(/_/g, " ")
                  .toLowerCase()
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
            ))
          ) : (
            <span className="text-slate-500 italic">None specified</span>
          )}
        </div>
      </div>

      {/* Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-6 border-t border-border">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              eventInfo.receiveUpdates ? "bg-green-500" : "bg-gray-300"
            }`}
          />
          <span className="text-sm font-medium">Receive Updates</span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              eventInfo.inviteToFutureEvents ? "bg-green-500" : "bg-gray-300"
            }`}
          />
          <span className="text-sm font-medium">Invite to Future Events</span>
        </div>
      </div>
    </div>
  </SectionCard>
);

const EmergencyInfoSection: React.FC<{
  emergencyInfo: VisitorData["emergencyInfo"];
}> = ({ emergencyInfo }) => (
  <SectionCard
    title="Emergency & Safety Information"
    icon={<Shield className="h-5 w-5" />}
  >
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <InfoField
        label="Emergency Contact Person"
        value={emergencyInfo.emergencyContactPerson}
        copyable
      />
      <InfoField
        label="Emergency Contact Number"
        value={emergencyInfo.emergencyContactNumber}
        copyable
      />
      <InfoField
        label="Special Assistance"
        value={emergencyInfo.specialAssistance}
        className="lg:col-span-2"
      />
    </div>
  </SectionCard>
);

const ConsentInfoSection: React.FC<{
  consentInfo: VisitorData["consentInfo"];
}> = ({ consentInfo }) => {
  const hearAboutDisplay = consentInfo.hearAboutOthers
    ? `${consentInfo.hearAboutEvent} (${consentInfo.hearAboutOthers})`
    : consentInfo.hearAboutEvent;

  return (
    <SectionCard
      title="Consent & Privacy Information"
      icon={<UserCheck className="h-5 w-5" />}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              consentInfo.dataPrivacyConsent ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm font-medium">
            Data Privacy Consent:{" "}
            {consentInfo.dataPrivacyConsent ? "Given" : "Not Given"}
          </span>
        </div>

        <InfoField
          label="How did you hear about this event?"
          value={hearAboutDisplay}
        />
      </div>
    </SectionCard>
  );
};

// Main Dialog Component
const VisitorRegistrationDialog: React.FC<VisitorRegistrationDialogProps> = ({
  visitor,
  getStatusBadge,
}) => {
  const fullName = `${visitor.personalInfo.firstName} ${visitor.personalInfo.lastName}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Eye className="mr-2 h-4 w-4" />
          View details
        </DropdownMenuItem>
      </DialogTrigger>

      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pb-6">
          <DialogTitle className="text-3xl font-bold flex items-center gap-3">
            <div className="p-3 rounded-xl">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            Visitor Registration
          </DialogTitle>
          <DialogDescription className="text-lg font-medium">
            Complete registration details for {fullName}
          </DialogDescription>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>ID: {visitor.id}</span>
            <span>•</span>
            <span>
              Registered: {new Date(visitor.createdAt).toLocaleDateString()}
            </span>
            {visitor.updatedAt !== visitor.createdAt && (
              <>
                <span>•</span>
                <span>
                  Updated: {new Date(visitor.updatedAt).toLocaleDateString()}
                </span>
              </>
            )}
          </div>
        </DialogHeader>

        <Separator className="bg-slate-200" />

        <div className="space-y-8 py-6">
          <PersonalInfoSection personalInfo={visitor.personalInfo} />

          <ContactInfoSection
            contactInfo={visitor.contactInfo}
            getStatusBadge={getStatusBadge}
          />

          <ProfessionalInfoSection
            professionalInfo={visitor.professionalInfo}
          />

          <EventInfoSection eventInfo={visitor.eventInfo} />

          <EmergencyInfoSection emergencyInfo={visitor.emergencyInfo} />

          <ConsentInfoSection consentInfo={visitor.consentInfo} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VisitorRegistrationDialog;
