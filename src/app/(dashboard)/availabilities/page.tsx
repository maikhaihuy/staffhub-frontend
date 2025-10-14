'use client';

import { useState } from "react"
import { Calendar, Check, X, Clock } from "lucide-react"
import { Employee } from "@/features/employee/types";
import { WeeklyAvailability } from "@/features/availabilities/types";

// Sample employees
const sampleEmployees: Employee[] = [
  { id: 1, name: "Sarah Johnson", phone: "123-456-7890", branchIds: [1, 2] },
  { id: 2, name: "Mike Chen", phone: "987-654-3210", branchIds: [1, 3] },
  { id: 3, name: "Emily Davis", phone: "555-555-5555", branchIds: [2, 3] },
  { id: 4, name: "James Wilson", phone: "111-222-3333", branchIds: [1, 2, 3] },
  { id: 5, name: "Lisa Rodriguez", phone: "444-555-6666", branchIds: [2, 3] },
]

// Days of the week
const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

// Sample availability data
const sampleAvailability: WeeklyAvailability = {
  1: {
    Mon: { available: true, hours: "9-17" },
    Tue: { available: true, hours: "9-17" },
    Wed: { available: true, hours: "9-17" },
    Thu: { available: true, hours: "9-17" },
    Fri: { available: true, hours: "9-17" },
    Sat: { available: false },
    Sun: { available: false },
  },
  2: {
    Mon: { available: true, hours: "14-22" },
    Tue: { available: true, hours: "14-22" },
    Wed: { available: false },
    Thu: { available: true, hours: "14-22" },
    Fri: { available: true, hours: "14-22" },
    Sat: { available: true, hours: "10-18" },
    Sun: { available: true, hours: "10-18" },
  },
  3: {
    Mon: { available: true, hours: "10-18" },
    Tue: { available: true, hours: "10-18" },
    Wed: { available: true, hours: "10-18" },
    Thu: { available: false },
    Fri: { available: true, hours: "10-18" },
    Sat: { available: true, hours: "9-17" },
    Sun: { available: false },
  },
  4: {
    Mon: { available: true, hours: "6-14" },
    Tue: { available: true, hours: "6-14" },
    Wed: { available: true, hours: "6-14" },
    Thu: { available: true, hours: "6-14" },
    Fri: { available: true, hours: "6-14" },
    Sat: { available: false },
    Sun: { available: false },
  },
  5: {
    Mon: { available: true, hours: "8-16" },
    Tue: { available: true, hours: "8-16" },
    Wed: { available: true, hours: "8-16" },
    Thu: { available: true, hours: "8-16" },
    Fri: { available: true, hours: "8-16" },
    Sat: { available: true, hours: "12-20" },
    Sun: { available: true, hours: "12-20" },
  },
}

export default function AvailabilitiesPage() {
  const [employees] = useState<Employee[]>(sampleEmployees)
  const [availability, setAvailability] = useState<WeeklyAvailability>(sampleAvailability)

  const toggleAvailability = (employeeId: number, day: string) => {
    setAvailability((prev) => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [day]: {
          ...prev[employeeId]?.[day],
          available: !prev[employeeId]?.[day]?.available,
        },
      },
    }))
  }

  const getAvailabilityCell = (employee: Employee, day: string) => {
    const dayAvailability = availability[employee.id!]?.[day]
    const isAvailable = dayAvailability?.available || false
    const hours = dayAvailability?.hours

    return (
      <td key={`${employee.id}-${day}`} className="p-2 border-r border-border last:border-r-0">
        <button
          onClick={() => toggleAvailability(employee.id!, day)}
          className={`w-full h-16 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1 hover:scale-105 ${
            isAvailable
              ? "bg-green-50 border-green-200 hover:bg-green-100"
              : "bg-red-50 border-red-200 hover:bg-red-100"
          }`}
        >
          {isAvailable ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              {hours && <span className="text-xs text-green-700 font-medium">{hours}</span>}
            </>
          ) : (
            <X className="h-4 w-4 text-red-600" />
          )}
        </button>
      </td>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Employee Availability</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
              <span>Unavailable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground min-w-[200px]">
                  Employee
                </th>
                {daysOfWeek.map((day) => (
                  <th
                    key={day}
                    className="px-4 py-4 text-center text-sm font-medium text-muted-foreground min-w-[100px]"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-b border-border last:border-0 hover:bg-muted/25">
                  <td className="px-6 py-4 border-r border-border">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">{employee.name}</span>
                      <span className="text-xs text-muted-foreground">{employee.phone}</span>
                    </div>
                  </td>
                  {daysOfWeek.map((day) => getAvailabilityCell(employee, day))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-foreground">Total Employees</span>
          </div>
          <span className="text-2xl font-bold text-foreground">{employees.length}</span>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-foreground">Available Today</span>
          </div>
          <span className="text-2xl font-bold text-foreground">
            {employees.filter((emp) => availability[emp.id!]?.Mon?.available).length}
          </span>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-foreground">Coverage Rate</span>
          </div>
          <span className="text-2xl font-bold text-foreground">
            {Math.round(
              (employees.filter((emp) => availability[emp.id!]?.Mon?.available).length / employees.length) * 100,
            )}
            %
          </span>
        </div>
      </div>
    </div>
  )
}
