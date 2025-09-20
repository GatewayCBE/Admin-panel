import { useState, useEffect } from "react";
import { getTurfs } from "../../../services/firestoreService";

export const useTurf = () => {
    const [turfs, setTurfs] = useState<Turf[]>([]);

    useEffect(() => {
        const fetchData = async () => {
          const turfData = await getTurfs();
          setTurfs(
            turfData.map((turf: any) => ({
              turf_id: turf.turf_id ?? turf.id ?? "",
              turf_name: turf.turf_name ?? "",
              turf_location: turf.turf_location ?? "",
              owner_id: turf.owner_id ?? "",
              turf_closing_hour: turf.turf_closing_hour ?? "",
              turf_opening_hour: turf.turf_opening_hour ?? "",
            }))
          );
        };
        fetchData();
      }, []);

      return { turfs };
}