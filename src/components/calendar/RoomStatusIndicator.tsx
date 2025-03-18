
interface RoomStatusIndicatorProps {
  status: "available" | "partial" | "booked";
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function RoomStatusIndicator({ status, label, size = "md" }: RoomStatusIndicatorProps) {
  const getStatusColor = () => {
    switch (status) {
      case "available":
        return "bg-success/20 border-success/40";
      case "partial":
        return "bg-warning/20 border-warning/40";
      case "booked":
        return "bg-destructive/20 border-destructive/40";
      default:
        return "bg-muted border-muted-foreground/40";
    }
  };

  const getStatusTextColor = () => {
    switch (status) {
      case "available":
        return "text-success";
      case "partial":
        return "text-warning";
      case "booked":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "w-2 h-2";
      case "lg":
        return "w-4 h-4";
      default:
        return "w-3 h-3";
    }
  };

  return (
    <div className="flex items-center">
      <div className={`${getSizeClass()} rounded-full ${getStatusColor()} border`} />
      {label && (
        <span className={`text-sm ml-1.5 ${getStatusTextColor()}`}>{label}</span>
      )}
    </div>
  );
}
