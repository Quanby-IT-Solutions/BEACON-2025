"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  Eye,
  Mail,
  MoreHorizontal,
  Phone,
  Trash2,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Types
interface VisitorData {
  id: string;
  createdAt: string;
  updatedAt: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    middleName: string;
    suffix: string;
    preferredName: string;
    gender: string;
    genderOthers: string;
    ageBracket: string;
    nationality: string;
    faceScannedUrl: string;
  };
  contactInfo: {
    email: string;
    mobileNumber: string;
    landline: string;
    mailingAddress: string;
    status: string;
  };
  professionalInfo: {
    jobTitle: string;
    companyName: string;
    industry: string;
    industryOthers: string;
    companyAddress: string;
    companyWebsite: string;
    businessEmail: string;
  };
  eventInfo: {
    attendingDays: string[];
    eventParts: string[];
    attendeeType: string;
    interestAreas: string[];
    receiveUpdates: boolean;
    inviteToFutureEvents: boolean;
  };
  emergencyInfo: {
    specialAssistance: string;
    emergencyContactPerson: string;
    emergencyContactNumber: string;
  };
  consentInfo: {
    dataPrivacyConsent: boolean;
    hearAboutEvent: string;
    hearAboutOthers: string;
  };
}

interface VisitorsDataTableProps {
  data: VisitorData[];
  onDeleteVisitor: (visitorId: string, visitorName: string) => void;
  isDeleting: boolean;
  currentAdminStatus: "SUPERADMIN" | "ADMIN";
}

export function VisitorsDataTable({
  data,
  onDeleteVisitor,
  isDeleting,
  currentAdminStatus,
}: VisitorsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      middleName: false,
      suffix: false,
      gender: false,
      ageBracket: false,
      nationality: false,
      landline: false,
      mailingAddress: false,
      jobTitle: false,
      industry: false,
      businessEmail: false,
      attendeeType: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});

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

  const columns: ColumnDef<VisitorData>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "personalInfo.firstName",
      id: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            <User className="mr-2 h-4 w-4" />
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const firstName = row.original.personalInfo.firstName;
        const lastName = row.original.personalInfo.lastName;
        const preferredName = row.original.personalInfo.preferredName;

        return (
          <div className="font-medium">
            {firstName} {lastName}
            {preferredName && (
              <span className="text-sm text-muted-foreground ml-1">
                ({preferredName})
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "contactInfo.email",
      id: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            <Mail className="mr-2 h-4 w-4" />
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center">
          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{row.original.contactInfo.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "personalInfo.middleName",
      id: "middleName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Middle Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.personalInfo.middleName || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "personalInfo.suffix",
      id: "suffix",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Suffix
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.personalInfo.suffix || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "personalInfo.gender",
      id: "gender",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Gender
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-sm">{row.original.personalInfo.gender}</div>
      ),
    },
    {
      accessorKey: "personalInfo.ageBracket",
      id: "ageBracket",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Age Bracket
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-sm">{row.original.personalInfo.ageBracket}</div>
      ),
    },
    {
      accessorKey: "personalInfo.nationality",
      id: "nationality",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Nationality
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-sm">{row.original.personalInfo.nationality}</div>
      ),
    },
    {
      accessorKey: "contactInfo.mobileNumber",
      id: "mobile",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            <Phone className="mr-2 h-4 w-4" />
            Mobile
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center">
          <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {row.original.contactInfo.mobileNumber}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "contactInfo.landline",
      id: "landline",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Landline
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.contactInfo.landline || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "contactInfo.mailingAddress",
      id: "mailingAddress",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Mailing Address
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-sm max-w-xs truncate">
          {row.original.contactInfo.mailingAddress || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "professionalInfo.jobTitle",
      id: "jobTitle",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Job Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-sm">{row.original.professionalInfo.jobTitle}</div>
      ),
    },
    {
      accessorKey: "professionalInfo.companyName",
      id: "company",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Company
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.professionalInfo.companyName}
        </div>
      ),
    },
    {
      accessorKey: "professionalInfo.industry",
      id: "industry",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Industry
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-sm">{row.original.professionalInfo.industry}</div>
      ),
    },
    {
      accessorKey: "professionalInfo.businessEmail",
      id: "businessEmail",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Business Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.professionalInfo.businessEmail || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "eventInfo.attendeeType",
      id: "attendeeType",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Attendee Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-sm">{row.original.eventInfo.attendeeType}</div>
      ),
    },
    {
      accessorKey: "contactInfo.status",
      id: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => getStatusBadge(row.original.contactInfo.status),
    },
    {
      accessorKey: "createdAt",
      id: "registered",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Registered
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const visitor = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(visitor.contactInfo.email)
                }
              >
                Copy email
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {/* View Details */}
              <Dialog>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Eye className="mr-2 h-4 w-4" />
                    View details
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      Visitor Details: {visitor.personalInfo.firstName}{" "}
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
                          <label className="font-medium">Full Name:</label>
                          <p>
                            {visitor.personalInfo.firstName}{" "}
                            {visitor.personalInfo.middleName}{" "}
                            {visitor.personalInfo.lastName}{" "}
                            {visitor.personalInfo.suffix}
                          </p>
                        </div>
                        <div>
                          <label className="font-medium">Preferred Name:</label>
                          <p>{visitor.personalInfo.preferredName || "N/A"}</p>
                        </div>
                        <div>
                          <label className="font-medium">Gender:</label>
                          <p>
                            {visitor.personalInfo.gender}{" "}
                            {visitor.personalInfo.genderOthers &&
                              `(${visitor.personalInfo.genderOthers})`}
                          </p>
                        </div>
                        <div>
                          <label className="font-medium">Age Bracket:</label>
                          <p>{visitor.personalInfo.ageBracket}</p>
                        </div>
                        <div>
                          <label className="font-medium">Nationality:</label>
                          <p>{visitor.personalInfo.nationality}</p>
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
                          <label className="font-medium">Email:</label>
                          <p>{visitor.contactInfo.email}</p>
                        </div>
                        <div>
                          <label className="font-medium">Mobile Number:</label>
                          <p>{visitor.contactInfo.mobileNumber}</p>
                        </div>
                        <div>
                          <label className="font-medium">Landline:</label>
                          <p>{visitor.contactInfo.landline || "N/A"}</p>
                        </div>
                        <div>
                          <label className="font-medium">
                            Mailing Address:
                          </label>
                          <p>{visitor.contactInfo.mailingAddress || "N/A"}</p>
                        </div>
                        <div>
                          <label className="font-medium">Status:</label>
                          <p>{getStatusBadge(visitor.contactInfo.status)}</p>
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
                          <label className="font-medium">Job Title:</label>
                          <p>{visitor.professionalInfo.jobTitle}</p>
                        </div>
                        <div>
                          <label className="font-medium">Company:</label>
                          <p>{visitor.professionalInfo.companyName}</p>
                        </div>
                        <div>
                          <label className="font-medium">Industry:</label>
                          <p>
                            {visitor.professionalInfo.industry}{" "}
                            {visitor.professionalInfo.industryOthers &&
                              `(${visitor.professionalInfo.industryOthers})`}
                          </p>
                        </div>
                        <div>
                          <label className="font-medium">
                            Company Address:
                          </label>
                          <p>
                            {visitor.professionalInfo.companyAddress || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="font-medium">
                            Company Website:
                          </label>
                          <p>
                            {visitor.professionalInfo.companyWebsite ? (
                              <a
                                href={visitor.professionalInfo.companyWebsite}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                {visitor.professionalInfo.companyWebsite}
                              </a>
                            ) : (
                              "N/A"
                            )}
                          </p>
                        </div>
                        <div>
                          <label className="font-medium">Business Email:</label>
                          <p>
                            {visitor.professionalInfo.businessEmail || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Event Information */}
                    <div>
                      <h3 className="font-semibold mb-3">Event Information</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="font-medium">Attendee Type:</label>
                          <p>{visitor.eventInfo.attendeeType}</p>
                        </div>
                        <div>
                          <label className="font-medium">Attending Days:</label>
                          <p>{visitor.eventInfo.attendingDays.join(", ")}</p>
                        </div>
                        <div>
                          <label className="font-medium">Event Parts:</label>
                          <p>{visitor.eventInfo.eventParts.join(", ")}</p>
                        </div>
                        <div>
                          <label className="font-medium">Interest Areas:</label>
                          <p>{visitor.eventInfo.interestAreas.join(", ")}</p>
                        </div>
                      </div>
                    </div>

                    {/* Emergency Information */}
                    <div>
                      <h3 className="font-semibold mb-3">Emergency Contact</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="font-medium">Contact Person:</label>
                          <p>{visitor.emergencyInfo.emergencyContactPerson}</p>
                        </div>
                        <div>
                          <label className="font-medium">Contact Number:</label>
                          <p>{visitor.emergencyInfo.emergencyContactNumber}</p>
                        </div>
                        <div>
                          <label className="font-medium">
                            Special Assistance:
                          </label>
                          <p>
                            {visitor.emergencyInfo.specialAssistance || "None"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Consent & Marketing */}
                    <div>
                      <h3 className="font-semibold mb-3">
                        Consent & Marketing
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="font-medium">
                            Data Privacy Consent:
                          </label>
                          <p>
                            {visitor.consentInfo.dataPrivacyConsent
                              ? "Yes"
                              : "No"}
                          </p>
                        </div>
                        <div>
                          <label className="font-medium">
                            Receive Updates:
                          </label>
                          <p>
                            {visitor.eventInfo.receiveUpdates ? "Yes" : "No"}
                          </p>
                        </div>
                        <div>
                          <label className="font-medium">
                            Future Event Invites:
                          </label>
                          <p>
                            {visitor.eventInfo.inviteToFutureEvents
                              ? "Yes"
                              : "No"}
                          </p>
                        </div>
                        <div>
                          <label className="font-medium">
                            Heard About Event:
                          </label>
                          <p>
                            {visitor.consentInfo.hearAboutEvent}
                            {visitor.consentInfo.hearAboutOthers &&
                              ` (${visitor.consentInfo.hearAboutOthers})`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Face Capture */}
                    {visitor.personalInfo.faceScannedUrl && (
                      <div>
                        <h3 className="font-semibold mb-3">Face Capture</h3>
                        <div className="text-sm">
                          <label className="font-medium">Face Scan:</label>
                          <div className="mt-2">
                            <a
                              href={visitor.personalInfo.faceScannedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Face Scan
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Delete - Only for SUPERADMIN */}
              {currentAdminStatus === "SUPERADMIN" && (
                <>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete visitor
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Visitor</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete{" "}
                          <strong>
                            {visitor.personalInfo.firstName}{" "}
                            {visitor.personalInfo.lastName}
                          </strong>
                          ? This action cannot be undone and will remove all
                          associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            onDeleteVisitor(
                              visitor.id,
                              `${visitor.personalInfo.firstName} ${visitor.personalInfo.lastName}`
                            )
                          }
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            "Delete"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter emails..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-56">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                const columnLabels: Record<string, string> = {
                  name: "Name",
                  email: "Email",
                  middleName: "Middle Name",
                  suffix: "Suffix",
                  gender: "Gender",
                  ageBracket: "Age Bracket",
                  nationality: "Nationality",
                  mobile: "Mobile",
                  landline: "Landline",
                  mailingAddress: "Mailing Address",
                  jobTitle: "Job Title",
                  company: "Company",
                  industry: "Industry",
                  businessEmail: "Business Email",
                  attendeeType: "Attendee Type",
                  status: "Status",
                  registered: "Registered",
                };

                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {columnLabels[column.id] || column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-row items-center justify-end w-full  space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground  w-fit">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2 ">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8 ">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              {"<<"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              {"<"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              {">"}
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              {">>"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
