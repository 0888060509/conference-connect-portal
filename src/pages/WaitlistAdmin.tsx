
import { Layout } from "@/components/layout/Layout";
import { WaitlistManagement } from "@/components/bookings/WaitlistManagement";

export default function WaitlistAdmin() {
  return (
    <Layout title="Booking Waitlist">
      <WaitlistManagement />
    </Layout>
  );
}
