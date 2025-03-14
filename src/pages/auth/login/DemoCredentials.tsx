
import { Separator } from "@/components/ui/separator";

export default function DemoCredentials() {
  return (
    <div className="mt-6 border-t pt-4">
      <p className="text-sm text-gray-600 mb-2">Demo credentials:</p>
      <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
        <div>
          <p className="font-semibold">Admin user:</p>
          <p>admin@example.com</p>
          <p>password: password</p>
        </div>
        <div>
          <p className="font-semibold">Regular user:</p>
          <p>user@example.com</p>
          <p>password: password</p>
        </div>
      </div>
    </div>
  );
}
