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

          turf_image_url: turf.turf_image_url ?? null,
          turf_images: turf.turf_images ?? [],

          // NEW DATA MAPPED
          amenities: turf.amenities ?? [],
          available_sports_list: turf.available_sports_list ?? [],

          turf_description: turf.turf_description ?? "",

          sports_specific_person_count: turf.sports_specific_person_count ?? {},
          sport_specific_price: turf.sport_specific_price ?? {},
          sport_specific_timing: turf.sport_specific_timing ?? {},

          turf_length: turf.turf_length ?? "",
          turf_breadth: turf.turf_breadth ?? "",
          turf_height: turf.turf_height ?? "",

          turf_active_status: turf.turf_active_status ?? true,
        }))
      );
    };

    fetchData();
  }, []);

  return { turfs };
};