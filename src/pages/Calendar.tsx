
import { Layout } from "@/components/layout/Layout";
import { CalendarView } from "@/components/calendar/CalendarView";
import { useState } from "react";

export default function Calendar() {
  return (
    <Layout title="Meeting Calendar">
      <CalendarView />
    </Layout>
  );
}
