
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function RoomStatistics() {
  const [period, setPeriod] = useState("month");
  const [chartType, setChartType] = useState("usage");

  // Mock data for room usage statistics
  const usageData = [
    { name: "Executive Boardroom", usage: 87, bookings: 34 },
    { name: "Conference Room Alpha", usage: 63, bookings: 21 },
    { name: "Small Meeting Room", usage: 45, bookings: 15 },
    { name: "Training Room", usage: 72, bookings: 12 },
    { name: "Innovation Lab", usage: 51, bookings: 9 },
  ];

  // Mock data for time slot popularity
  const timeSlotData = [
    { name: "8:00 - 10:00", bookings: 42 },
    { name: "10:00 - 12:00", bookings: 78 },
    { name: "12:00 - 14:00", bookings: 35 },
    { name: "14:00 - 16:00", bookings: 65 },
    { name: "16:00 - 18:00", bookings: 48 },
  ];

  // Mock data for capacity utilization
  const capacityData = [
    { name: "Small (1-6)", rooms: 5, utilization: 78 },
    { name: "Medium (7-12)", rooms: 3, utilization: 65 },
    { name: "Large (13+)", rooms: 2, utilization: 48 },
  ];

  // Mock data for amenities popularity
  const amenitiesData = [
    { name: "Video Conferencing", value: 85 },
    { name: "Projector", value: 70 },
    { name: "Whiteboard", value: 55 },
    { name: "TV Screen", value: 40 },
    { name: "Sound System", value: 25 },
  ];

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <Tabs value={chartType} onValueChange={setChartType} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="time">Time Slots</TabsTrigger>
            <TabsTrigger value="capacity">Capacity</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="quarter">Last Quarter</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={chartType} onValueChange={setChartType}>
        <TabsContent value="usage" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Room Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={usageData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                    <YAxis label={{ value: 'Usage (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="usage" name="Utilization (%)" fill="#8884d8" />
                    <Bar dataKey="bookings" name="Total Bookings" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Popular Time Slots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={timeSlotData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Number of Bookings', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="bookings" name="Bookings" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capacity" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Room Capacity Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={capacityData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rooms" name="Number of Rooms" fill="#FFBB28" />
                    <Bar dataKey="utilization" name="Utilization (%)" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="amenities" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Popular Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={amenitiesData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {amenitiesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">10</div>
            <p className="text-sm text-muted-foreground mt-1">
              Across 3 buildings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Average Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">68%</div>
            <p className="text-sm text-muted-foreground mt-1">
              Up 5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">243</div>
            <p className="text-sm text-muted-foreground mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
