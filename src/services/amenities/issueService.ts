
import { AmenityIssue } from "./types";
import { amenityIssues } from "./mockData";

// Issues
export const getAmenityIssues = async (): Promise<AmenityIssue[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...amenityIssues];
};

export const createAmenityIssue = async (issue: Omit<AmenityIssue, "id" | "status" | "reportedDate">): Promise<AmenityIssue> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newIssue: AmenityIssue = {
    ...issue,
    id: Math.random().toString(36).substring(2, 9),
    status: "open",
    reportedDate: new Date().toISOString()
  };
  
  amenityIssues.push(newIssue);
  return newIssue;
};

export const updateAmenityIssue = async (id: string, issue: Partial<AmenityIssue>): Promise<AmenityIssue> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = amenityIssues.findIndex(i => i.id === id);
  if (index === -1) throw new Error("Issue not found");
  
  amenityIssues[index] = { ...amenityIssues[index], ...issue };
  
  // If resolving the issue, set resolved date
  if (issue.status === "resolved" && !amenityIssues[index].resolvedDate) {
    amenityIssues[index].resolvedDate = new Date().toISOString();
  }
  
  return amenityIssues[index];
};
