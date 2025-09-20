import React, { useEffect, useState } from "react";
import { getBookedSlots } from "../../../services/firestoreService";

export const useSlot = (turfId: string | undefined, selectedDate: string) => {
      const [slots, setSlots] = useState<SlotData[]>([]);

      useEffect(() => {
          if (turfId && selectedDate) {
            getBookedSlots(turfId, selectedDate).then(setSlots);
          }
        }, [turfId, selectedDate]);

        return { slots };
}

    