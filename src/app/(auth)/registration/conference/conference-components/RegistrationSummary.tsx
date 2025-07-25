"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  DollarSign,
  Shield,
  FileText,
  CheckCircle,
  AlertTriangle,
  Star,
} from "lucide-react";
import {
  conferenceInterestAreasOptions,
  ageBracketOptions,
  genderOptions,
} from "@/types/conference/registration";
import { useConferenceRegistrationStore } from "@/hooks/standard-hooks/conference/useConferenceRegistrationStore";
import { RegistrationSummaryProps } from "@/types/conference/components";

export default function RegistrationSummary({
  form,
}: RegistrationSummaryProps) {
  const { selectedEvents, totalAmount, requiresPayment } =
    useConferenceRegistrationStore();
  const formData = form.getValues();

  const formatPrice = (price: number) => {
    return price === 0 ? "FREE" : `₱${price.toLocaleString()}`;
  };

  const getGenderLabel = (value: string) => {
    return (
      genderOptions.find((option) => option.value === value)?.label || value
    );
  };

  const getAgeBracketLabel = (value: string) => {
    return (
      ageBracketOptions.find((option) => option.value === value)?.label || value
    );
  };

  const getInterestAreaLabel = (value: string) => {
    return (
      conferenceInterestAreasOptions.find((option) => option.value === value)
        ?.label || value
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Registration Summary
        </h3>
        <p className="text-sm text-muted-foreground">
          Please review your registration details before submitting.
        </p>
      </div>

      <div className="space-y-4">
        {/* Maritime League Membership */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Maritime League Membership
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge
                  variant={
                    formData.isMaritimeLeagueMember === "YES"
                      ? "default"
                      : "secondary"
                  }
                >
                  {formData.isMaritimeLeagueMember === "YES" && "TML Member"}
                  {formData.isMaritimeLeagueMember === "NO" && "Non-Member"}
                </Badge>
              </div>
              {formData.tmlMemberCode && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Member Code:
                  </span>
                  <span className="font-mono text-sm">
                    {formData.tmlMemberCode}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Selected Events */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Selected Events ({selectedEvents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between py-2 border-b last:border-b-0"
                  >
                    <span className="font-medium">{event.name}</span>
                    <Badge variant="outline">{formatPrice(event.price)}</Badge>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between font-semibold">
                    <span>Total Amount:</span>
                    <span className="text-lg">
                      {requiresPayment
                        ? formatPrice(totalAmount)
                        : "FREE (TML Member)"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No events selected
              </p>
            )}
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <p className="font-medium">
                    {[
                      formData.firstName,
                      formData.middleName,
                      formData.lastName,
                      formData.suffix,
                    ]
                      .filter(Boolean)
                      .join(" ") || "Not provided"}
                  </p>
                </div>
                {formData.preferredName && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Preferred Name:
                    </span>
                    <p className="font-medium">{formData.preferredName}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-muted-foreground">Gender:</span>
                  <p className="font-medium">
                    {getGenderLabel(formData.gender)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Age Bracket:
                  </span>
                  <p className="font-medium">
                    {getAgeBracketLabel(formData.ageBracket)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Nationality:
                  </span>
                  <p className="font-medium">
                    {formData.nationality || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{formData.email || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{formData.mobileNumber || "Not provided"}</span>
              </div>
              {formData.mailingAddress && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <span className="text-sm">{formData.mailingAddress}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        {(formData.jobTitle || formData.companyName || formData.industry) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building className="h-4 w-4" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {formData.jobTitle && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Position:
                    </span>
                    <p className="font-medium">{formData.jobTitle}</p>
                  </div>
                )}
                {formData.companyName && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Company:
                    </span>
                    <p className="font-medium">{formData.companyName}</p>
                  </div>
                )}
                {formData.industry && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Industry:
                    </span>
                    <p className="font-medium">{formData.industry}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Areas of Interest */}
        {formData.interestAreas && formData.interestAreas.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="h-4 w-4" />
                Areas of Interest
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {formData.interestAreas.map((area) => (
                  <Badge key={area} variant="secondary" className="text-xs">
                    {getInterestAreaLabel(area)}
                  </Badge>
                ))}
              </div>
              {formData.otherInterests && (
                <div className="mt-3 pt-3 border-t">
                  <span className="text-sm text-muted-foreground">
                    Additional Comments:
                  </span>
                  <p className="text-sm mt-1">{formData.otherInterests}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Consent Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Consent & Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Data Privacy Consent:</span>
                <Badge
                  variant={
                    formData.dataUsageConsent ? "default" : "destructive"
                  }
                >
                  {formData.dataUsageConsent ? "Granted" : "Required"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Photo/Video Consent:</span>
                <Badge
                  variant={formData.photoVideoConsent ? "default" : "secondary"}
                >
                  {formData.photoVideoConsent ? "Granted" : "Not Granted"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Digital Certificate:</span>
                <Badge
                  variant={formData.emailCertificate ? "default" : "secondary"}
                >
                  {formData.emailCertificate ? "Requested" : "Not Requested"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Future Event Invites:</span>
                <Badge
                  variant={
                    formData.receiveEventInvites ? "default" : "secondary"
                  }
                >
                  {formData.receiveEventInvites ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        {requiresPayment && totalAmount > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-yellow-800">
                <DollarSign className="h-4 w-4" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-yellow-900">
                    Total Amount Due:
                  </span>
                  <span className="text-xl font-bold text-yellow-900">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
                <Alert className="border-yellow-300 bg-yellow-100">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    Payment will be processed via PayMongo after registration
                    submission. You will be redirected to a secure payment page.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TML Member Benefits */}
        {!requiresPayment && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                TML Member Benefits Applied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-green-800">
                <div className="flex items-center justify-between">
                  <span>Registration Fee:</span>
                  <span className="font-semibold">FREE</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>All Event Access:</span>
                  <span className="font-semibold">FREE</span>
                </div>
                {totalAmount > 0 && (
                  <div className="pt-2 border-t border-green-200">
                    <div className="flex items-center justify-between font-semibold">
                      <span>Total Savings:</span>
                      <span className="text-lg">
                        {formatPrice(totalAmount)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Final Confirmation */}
        <Alert className="border-blue-200 bg-blue-50">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Ready to submit!</strong> Please review all information
            above. Once submitted, you will receive a confirmation email with
            your registration details and next steps.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
