export interface Warehouse {
  id: string;
  name: string;
  type: "main" | "retail" | "transit";
  address: string;
  status: "active" | "inactive";
}