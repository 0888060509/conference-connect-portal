
import { Layout } from "@/components/layout/Layout";
import { SystemSettingsPanel } from "@/components/admin/SystemSettingsPanel";

export default function SystemSettings() {
  return (
    <Layout title="System Settings">
      <SystemSettingsPanel />
    </Layout>
  );
}
