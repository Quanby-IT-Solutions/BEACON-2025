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
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
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

// Types
interface ConferenceData {
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
  conferenceInfo: {
    isMaritimeLeagueMember: string;
    tmlMemberCode: string | null;
    jobTitle: string | null;
    companyName: string | null;
    industry: string | null;
    companyAddress: string | null;
    companyWebsite: string | null;
    interestAreas: string[];
    otherInterests: string | null;
    receiveEventInvites: boolean;
    emailCertificate: boolean;
    photoVideoConsent: boolean;
    dataUsageConsent: boolean;
  };
  paymentInfo: {
    totalPaymentAmount: number | null;
    customPaymentAmount: string | null;
    requiresPayment: boolean;
    paymentToken: string | null;
    paymentTokenExpiry: string | null;
    paymentStatus: string;
    paymentMode: string | null;
    isPaid: boolean;
    paymentConfirmedAt: string | null;
    paymentConfirmedBy: string | null;
    paymongoCheckoutId: string | null;
    transactionId: string | null;
  };
  selectedEvents: Array<{
    id: string;
    name: string;
    date: string;
    price: number;
    status: string;
  }>;
}

interface ConferenceDataTableProps {
  data: ConferenceData[];
  onDeleteConference: (conferenceId: string, attendeeName: string) => void;
  isDeleting: boolean;
  currentAdminStatus: "SUPERADMIN" | "ADMIN";
}

export function ConferenceDataTable({
  data,
  onDeleteConference,
  isDeleting,
  currentAdminStatus,
}: ConferenceDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
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

  const getPaymentStatusBadge = (isPaid: boolean, paymentStatus: string) => {
    if (isPaid) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="mr-1 h-3 w-3" />
          Paid
        </Badge>
      );
    }

    const statusMap: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        icon: React.ReactNode;
      }
    > = {
      PENDING: {
        variant: "secondary",
        icon: <Clock className="mr-1 h-3 w-3" />,
      },
      CONFIRMED: {
        variant: "default",
        icon: <CheckCircle className="mr-1 h-3 w-3" />,
      },
      FAILED: {
        variant: "destructive",
        icon: <XCircle className="mr-1 h-3 w-3" />,
      },
      REFUNDED: {
        variant: "outline",
        icon: <XCircle className="mr-1 h-3 w-3" />,
      },
    };

    const statusConfig = statusMap[paymentStatus] || {
      variant: "outline",
      icon: <Clock className="mr-1 h-3 w-3" />,
    };

    return (
      <Badge variant={statusConfig.variant}>
        {statusConfig.icon}
        {paymentStatus}
      </Badge>
    );
  };

  const getMembershipBadge = (membership: string) => {
    const badgeMap: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      YES: { variant: "default", label: "TML Member" },
      NO: { variant: "outline", label: "Non-Member" },
    };

    const config = badgeMap[membership] || {
      variant: "outline",
      label: membership,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns: ColumnDef<ConferenceData>[] = [
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
      accessorKey: "conferenceInfo.companyName",
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
          {row.original.conferenceInfo.companyName || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "conferenceInfo.isMaritimeLeagueMember",
      id: "membership",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Membership
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) =>
        getMembershipBadge(row.original.conferenceInfo.isMaritimeLeagueMember),
    },
    {
      accessorKey: "paymentInfo.isPaid",
      id: "payment",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Payment
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) =>
        getPaymentStatusBadge(
          row.original.paymentInfo.isPaid,
          row.original.paymentInfo.paymentStatus
        ),
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
        const conference = row.original;

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
                  navigator.clipboard.writeText(conference.contactInfo.email)
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
                      Conference Registration:{" "}
                      {conference.personalInfo.firstName}{" "}
                      {conference.personalInfo.lastName}
                    </DialogTitle>
                    <DialogDescription>
                      Complete conference registration information
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
                            {conference.personalInfo.firstName}{" "}
                            {conference.personalInfo.middleName}{" "}
                            {conference.personalInfo.lastName}{" "}
                            {conference.personalInfo.suffix}
                          </p>
                        </div>
                        <div>
                          <label className="font-medium">Preferred Name:</label>
                          <p>
                            {conference.personalInfo.preferredName || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="font-medium">Gender:</label>
                          <p>
                            {conference.personalInfo.gender}{" "}
                            {conference.personalInfo.genderOthers &&
                              `(${conference.personalInfo.genderOthers})`}
                          </p>
                        </div>
                        <div>
                          <label className="font-medium">Age Bracket:</label>
                          <p>{conference.personalInfo.ageBracket}</p>
                        </div>
                        <div>
                          <label className="font-medium">Nationality:</label>
                          <p>{conference.personalInfo.nationality}</p>
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
                          <p>{conference.contactInfo.email}</p>
                        </div>
                        <div>
                          <label className="font-medium">Mobile Number:</label>
                          <p>{conference.contactInfo.mobileNumber}</p>
                        </div>
                        <div>
                          <label className="font-medium">Landline:</label>
                          <p>{conference.contactInfo.landline || "N/A"}</p>
                        </div>
                        <div>
                          <label className="font-medium">Status:</label>
                          <p>{getStatusBadge(conference.contactInfo.status)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Conference Information */}
                    <div>
                      <h3 className="font-semibold mb-3">
                        Conference Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="font-medium">
                            Maritime League Member:
                          </label>
                          <p>
                            {getMembershipBadge(
                              conference.conferenceInfo.isMaritimeLeagueMember
                            )}
                          </p>
                        </div>
                        <div>
                          <label className="font-medium">
                            TML Member Code:
                          </label>
                          <p>
                            {conference.conferenceInfo.tmlMemberCode || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="font-medium">Job Title:</label>
                          <p>{conference.conferenceInfo.jobTitle || "N/A"}</p>
                        </div>
                        <div>
                          <label className="font-medium">Company:</label>
                          <p>
                            {conference.conferenceInfo.companyName || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="font-medium">Industry:</label>
                          <p>{conference.conferenceInfo.industry || "N/A"}</p>
                        </div>
                        <div>
                          <label className="font-medium">
                            Company Website:
                          </label>
                          <p>
                            {conference.conferenceInfo.companyWebsite || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Interest Areas */}
                    <div>
                      <h3 className="font-semibold mb-3">Interest Areas</h3>
                      <div className="text-sm">
                        <p>
                          {conference.conferenceInfo.interestAreas.join(", ") ||
                            "None specified"}
                        </p>
                        {conference.conferenceInfo.otherInterests && (
                          <p className="mt-2">
                            <strong>Other Interests:</strong>{" "}
                            {conference.conferenceInfo.otherInterests}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Selected Events */}
                    <div>
                      <h3 className="font-semibold mb-3">Selected Events</h3>
                      <div className="space-y-2">
                        {conference.selectedEvents.map((event, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
                          >
                            <div>
                              <p className="font-medium">{event.name}</p>
                              <p className="text-sm text-gray-600">
                                {event.status}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                ₱{Number(event.price).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div>
                      <h3 className="font-semibold mb-3">
                        Payment Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="font-medium">Payment Status:</label>
                          <p>
                            {getPaymentStatusBadge(
                              conference.paymentInfo.isPaid,
                              conference.paymentInfo.paymentStatus
                            )}
                          </p>
                        </div>
                        <div>
                          <label className="font-medium">Total Amount:</label>
                          <p>
                            ₱
                            {Number(
                              conference.paymentInfo.totalPaymentAmount || 0
                            ).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <label className="font-medium">Payment Mode:</label>
                          <p>{conference.paymentInfo.paymentMode || "N/A"}</p>
                        </div>
                        <div>
                          <label className="font-medium">Confirmed At:</label>
                          <p>
                            {conference.paymentInfo.paymentConfirmedAt
                              ? formatDate(
                                  conference.paymentInfo.paymentConfirmedAt
                                )
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
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
                        Delete registration
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete Conference Registration
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the conference
                          registration for{" "}
                          <strong>
                            {conference.personalInfo.firstName}{" "}
                            {conference.personalInfo.lastName}
                          </strong>
                          ? This action cannot be undone and will remove all
                          associated data including payment records.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            onDeleteConference(
                              conference.id,
                              `${conference.personalInfo.firstName} ${conference.personalInfo.lastName}`
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
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                const columnLabels: Record<string, string> = {
                  name: "Name",
                  email: "Email",
                  company: "Company",
                  membership: "Membership",
                  payment: "Payment",
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
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
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

        <div className="flex items-center space-x-6 lg:space-x-8">
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
