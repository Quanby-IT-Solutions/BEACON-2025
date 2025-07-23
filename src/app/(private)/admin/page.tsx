"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Users, LogOut, Eye, Mail, Phone } from "lucide-react";
import { useAdminStore } from "@/stores/adminStore";
import { useAdminVisitors } from "@/hooks/tanstasck-query/useAdminVisitors";
import { useAdminLogout } from "@/hooks/tanstasck-query/useAdminAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, currentAdmin, isSessionValid } = useAdminStore();
  const logout = useAdminLogout();
  const { data: visitorsData, isLoading, error, refetch } = useAdminVisitors();

  useEffect(() => {
    if (!isAuthenticated || !isSessionValid()) {
      router.push("/login");
    }
  }, [isAuthenticated, isSessionValid, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      ACTIVE: "default",
      PENDING: "secondary",
      INACTIVE: "destructive",
      VISITOR: "outline",
    };

    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Welcome back, {currentAdmin?.username}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">{currentAdmin?.status}</Badge>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Registered Visitors
            </CardTitle>
            <CardDescription>
              All visitor registrations for BEACON 2025 event
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading visitors...</span>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  Failed to load visitors.{" "}
                  {error instanceof Error ? error.message : "Please try again."}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    className="ml-2"
                  >
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {visitorsData && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Visitors:{" "}
                    <span className="font-semibold">{visitorsData.count}</span>
                  </p>
                  <Button variant="outline" onClick={() => refetch()}>
                    Refresh
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Mobile</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visitorsData.data.map((visitor) => (
                        <TableRow key={visitor.id}>
                          <TableCell className="font-medium">
                            {visitor.personalInfo.firstName}{" "}
                            {visitor.personalInfo.lastName}
                            {visitor.personalInfo.preferredName && (
                              <span className="text-sm text-gray-500 ml-1">
                                ({visitor.personalInfo.preferredName})
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-1 text-gray-400" />
                              {visitor.contactInfo.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-1 text-gray-400" />
                              {visitor.contactInfo.mobileNumber}
                            </div>
                          </TableCell>
                          <TableCell>
                            {visitor.professionalInfo.companyName}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(visitor.contactInfo.status)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {formatDate(visitor.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>
                                    Visitor Details:{" "}
                                    {visitor.personalInfo.firstName}{" "}
                                    {visitor.personalInfo.lastName}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Complete registration information
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-6">
                                  {/* Personal Information */}
                                  <div>
                                    <h3 className="font-semibold mb-3">
                                      Personal Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <label className="font-medium">
                                          Full Name:
                                        </label>
                                        <p>
                                          {visitor.personalInfo.firstName}{" "}
                                          {visitor.personalInfo.middleName}{" "}
                                          {visitor.personalInfo.lastName}{" "}
                                          {visitor.personalInfo.suffix}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="font-medium">
                                          Preferred Name:
                                        </label>
                                        <p>
                                          {visitor.personalInfo.preferredName ||
                                            "N/A"}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="font-medium">
                                          Gender:
                                        </label>
                                        <p>
                                          {visitor.personalInfo.gender}{" "}
                                          {visitor.personalInfo.genderOthers &&
                                            `(${visitor.personalInfo.genderOthers})`}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="font-medium">
                                          Age Bracket:
                                        </label>
                                        <p>{visitor.personalInfo.ageBracket}</p>
                                      </div>
                                      <div>
                                        <label className="font-medium">
                                          Nationality:
                                        </label>
                                        <p>
                                          {visitor.personalInfo.nationality}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Contact Information */}
                                  <div>
                                    <h3 className="font-semibold mb-3">
                                      Contact Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <label className="font-medium">
                                          Email:
                                        </label>
                                        <p>{visitor.contactInfo.email}</p>
                                      </div>
                                      <div>
                                        <label className="font-medium">
                                          Mobile Number:
                                        </label>
                                        <p>
                                          {visitor.contactInfo.mobileNumber}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="font-medium">
                                          Landline:
                                        </label>
                                        <p>
                                          {visitor.contactInfo.landline ||
                                            "N/A"}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="font-medium">
                                          Status:
                                        </label>
                                        <p>
                                          {getStatusBadge(
                                            visitor.contactInfo.status
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Professional Information */}
                                  <div>
                                    <h3 className="font-semibold mb-3">
                                      Professional Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <label className="font-medium">
                                          Job Title:
                                        </label>
                                        <p>
                                          {visitor.professionalInfo.jobTitle}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="font-medium">
                                          Company:
                                        </label>
                                        <p>
                                          {visitor.professionalInfo.companyName}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="font-medium">
                                          Industry:
                                        </label>
                                        <p>
                                          {visitor.professionalInfo.industry}{" "}
                                          {visitor.professionalInfo
                                            .industryOthers &&
                                            `(${visitor.professionalInfo.industryOthers})`}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="font-medium">
                                          Business Email:
                                        </label>
                                        <p>
                                          {visitor.professionalInfo
                                            .businessEmail || "N/A"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Event Information */}
                                  <div>
                                    <h3 className="font-semibold mb-3">
                                      Event Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <label className="font-medium">
                                          Attendee Type:
                                        </label>
                                        <p>{visitor.eventInfo.attendeeType}</p>
                                      </div>
                                      <div>
                                        <label className="font-medium">
                                          Attending Days:
                                        </label>
                                        <p>
                                          {visitor.eventInfo.attendingDays.join(
                                            ", "
                                          )}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="font-medium">
                                          Event Parts:
                                        </label>
                                        <p>
                                          {visitor.eventInfo.eventParts.join(
                                            ", "
                                          )}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="font-medium">
                                          Interest Areas:
                                        </label>
                                        <p>
                                          {visitor.eventInfo.interestAreas.join(
                                            ", "
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Emergency Information */}
                                  <div>
                                    <h3 className="font-semibold mb-3">
                                      Emergency Contact
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <label className="font-medium">
                                          Contact Person:
                                        </label>
                                        <p>
                                          {
                                            visitor.emergencyInfo
                                              .emergencyContactPerson
                                          }
                                        </p>
                                      </div>
                                      <div>
                                        <label className="font-medium">
                                          Contact Number:
                                        </label>
                                        <p>
                                          {
                                            visitor.emergencyInfo
                                              .emergencyContactNumber
                                          }
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
