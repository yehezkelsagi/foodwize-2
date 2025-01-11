import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AddPantryItemDialog from "@/components/pantry/AddPantryItemDialog";
import PantryItemCard from "@/components/pantry/PantryItemCard";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: pantryItems = [], refetch } = useQuery({
    queryKey: ["pantryItems"],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("pantry_items")
        .select("*")
        .eq('user_id', user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user, // Only run query if user is authenticated
  });

  const filteredItems = pantryItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#E5DFD7]">
      <div className="p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#F97316]">My Pantry</h1>
          <AddPantryItemDialog onItemAdded={refetch} />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <Input
            type="text"
            placeholder="Search pantry items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="text-gray-400" />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <PantryItemCard key={item.id} item={item} onDelete={refetch} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;