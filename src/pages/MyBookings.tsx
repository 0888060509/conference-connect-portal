
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { PersonalBookings } from "@/components/bookings/PersonalBookings";

export default function MyBookings() {
  return (
    <Layout title="My Bookings">
      <PersonalBookings />
    </Layout>
  );
}
