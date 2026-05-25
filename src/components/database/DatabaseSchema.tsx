
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TableColumn {
  name: string;
  type: string;
  description?: string;
  isPrimary?: boolean;
  isForeign?: boolean;
  reference?: string;
}

interface TableSchema {
  name: string;
  description?: string;
  columns: TableColumn[];
}

const databaseSchema: TableSchema[] = [
  {
    name: "organizations",
    description: "Organizations using the system",
    columns: [
      { name: "id", type: "uuid", isPrimary: true, description: "Primary key" },
      { name: "name", type: "varchar", description: "Organization name" },
      { name: "plan_type", type: "varchar", description: "Subscription plan" },
      { name: "plan_expires_at", type: "timestamp", description: "Plan expiration date" },
      { name: "contact_email", type: "varchar", description: "Contact email" },
      { name: "logo_url", type: "varchar", description: "Organization logo" },
      { name: "settings", type: "jsonb", description: "Organization settings" },
      { name: "created_at", type: "timestamp", description: "Creation timestamp" },
      { name: "updated_at", type: "timestamp", description: "Last update timestamp" }
    ]
  },
  {
    name: "users",
    description: "Application users",
    columns: [
      { name: "id", type: "uuid", isPrimary: true, description: "Primary key" },
      { name: "email", type: "varchar", description: "User email" },
      { name: "first_name", type: "varchar", description: "First name" },
      { name: "last_name", type: "varchar", description: "Last name" },
      { name: "role", type: "varchar", description: "User role" },
      { name: "organization_id", type: "uuid", isForeign: true, reference: "organizations.id", description: "Organization reference" },
      { name: "avatar_url", type: "varchar", description: "User avatar" },
      { name: "last_active", type: "timestamp", description: "Last active timestamp" },
      { name: "preferences", type: "jsonb", description: "User preferences" },
      { name: "created_at", type: "timestamp", description: "Creation timestamp" },
      { name: "updated_at", type: "timestamp", description: "Last update timestamp" }
    ]
  },
  {
    name: "events",
    description: "Events created by organizations",
    columns: [
      { name: "id", type: "uuid", isPrimary: true, description: "Primary key" },
      { name: "name", type: "varchar", description: "Event name" },
      { name: "description", type: "text", description: "Event description" },
      { name: "location", type: "varchar", description: "Event location" },
      { name: "start_date", type: "timestamp", description: "Event start date" },
      { name: "end_date", type: "timestamp", description: "Event end date" },
      { name: "organization_id", type: "uuid", isForeign: true, reference: "organizations.id", description: "Organization reference" },
      { name: "created_by", type: "uuid", isForeign: true, reference: "users.id", description: "Creator reference" },
      { name: "is_published", type: "boolean", description: "Publication status" },
      { name: "venue", type: "jsonb", description: "Venue details" },
      { name: "settings", type: "jsonb", description: "Event settings" },
      { name: "created_at", type: "timestamp", description: "Creation timestamp" },
      { name: "updated_at", type: "timestamp", description: "Last update timestamp" }
    ]
  },
  {
    name: "guests",
    description: "Event attendees",
    columns: [
      { name: "id", type: "uuid", isPrimary: true, description: "Primary key" },
      { name: "first_name", type: "varchar", description: "First name" },
      { name: "last_name", type: "varchar", description: "Last name" },
      { name: "email", type: "varchar", description: "Email address" },
      { name: "company", type: "varchar", description: "Company name" },
      { name: "phone", type: "varchar", description: "Phone number" },
      { name: "zone", type: "varchar", description: "Access zone" },
      { name: "status", type: "varchar", description: "Attendance status" },
      { name: "email_status", type: "varchar", description: "Email delivery status" },
      { name: "qr_code", type: "varchar", description: "QR code data" },
      { name: "invitation_sent_at", type: "timestamp", description: "Invitation sent timestamp" },
      { name: "invitation_opened_at", type: "timestamp", description: "Invitation opened timestamp" },
      { name: "checked_in_at", type: "timestamp", description: "Check-in timestamp" },
      { name: "event_id", type: "uuid", isForeign: true, reference: "events.id", description: "Event reference" },
      { name: "notes", type: "text", description: "Guest notes" },
      { name: "tags", type: "varchar[]", description: "Guest tags" },
      { name: "custom_field_values", type: "jsonb", description: "Custom field values" },
      { name: "created_at", type: "timestamp", description: "Creation timestamp" },
      { name: "updated_at", type: "timestamp", description: "Last update timestamp" }
    ]
  },
  {
    name: "scans",
    description: "QR code scan records",
    columns: [
      { name: "id", type: "uuid", isPrimary: true, description: "Primary key" },
      { name: "guest_id", type: "uuid", isForeign: true, reference: "guests.id", description: "Guest reference" },
      { name: "event_id", type: "uuid", isForeign: true, reference: "events.id", description: "Event reference" },
      { name: "timestamp", type: "timestamp", description: "Scan timestamp" },
      { name: "scanned_by", type: "uuid", isForeign: true, reference: "users.id", description: "Scanner reference" },
      { name: "location", type: "varchar", description: "Scan location" },
      { name: "device_info", type: "jsonb", description: "Device information" },
      { name: "verification_method", type: "varchar", description: "Verification method" },
      { name: "scan_result", type: "varchar", description: "Scan result" },
      { name: "created_at", type: "timestamp", description: "Creation timestamp" }
    ]
  }
];

export default function DatabaseSchema() {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Database Schema</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Supabase</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={databaseSchema[0].name}>
          <TabsList className="w-full overflow-x-auto flex flex-nowrap">
            {databaseSchema.map(table => (
              <TabsTrigger key={table.name} value={table.name} className="whitespace-nowrap">
                {table.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {databaseSchema.map(table => (
            <TabsContent key={table.name} value={table.name}>
              <div className="border rounded-md p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{table.name}</h3>
                  <p className="text-sm text-muted-foreground">{table.description}</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-3 text-left">Column</th>
                        <th className="py-2 px-3 text-left">Type</th>
                        <th className="py-2 px-3 text-left">Description</th>
                        <th className="py-2 px-3 text-left">Constraints</th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.columns.map(column => (
                        <tr key={column.name} className="border-b hover:bg-slate-100">
                          <td className="py-2 px-3 font-mono text-xs">
                            {column.name}
                            {column.isPrimary && <span className="ml-2 text-amber-600 font-semibold">PK</span>}
                            {column.isForeign && <span className="ml-2 text-blue-600 font-semibold">FK</span>}
                          </td>
                          <td className="py-2 px-3 font-mono text-xs">{column.type}</td>
                          <td className="py-2 px-3 text-xs">{column.description}</td>
                          <td className="py-2 px-3 text-xs">
                            {column.isPrimary && "PRIMARY KEY"}
                            {column.isForeign && column.reference && (
                              <span className="text-blue-600">→ {column.reference}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
