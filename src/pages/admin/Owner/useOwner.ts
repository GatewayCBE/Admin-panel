import { useState, useEffect } from 'react';
import { getOwners } from '../../../services/firestoreService';

export const useOwner = ()=> {
      const [ownersList, setOwnersList] = useState<OwnerData[]>([]);

 useEffect(() => {
    const fetchData = async () => {
      const ownerData = await getOwners();
      const formattedOwners: OwnerData[] = ownerData.map((owner: any) => ({
        owner_id: owner.owner_id ?? owner.id ?? "",
        owner_name: owner.owner_name ?? "",
        owner_email: owner.owner_email ?? "",
        owner_mobile_number: owner.owner_mobile_number ?? "",
      }));
      setOwnersList(formattedOwners);
    };
    fetchData();
  }, []);


  return {ownersList}
}