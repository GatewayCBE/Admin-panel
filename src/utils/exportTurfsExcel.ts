import * as XLSX from "xlsx";
import { saveAs } from "file-saver"

export const exportTurfsExcel = (turfs: any[]) => {
  const workbook = XLSX.utils.book_new();

  /* ===============================
     SHEET 1 : MASTER DATA
  =============================== */
  const masterData = turfs.map((turf, index) => ({
    SNo: index + 1,
    TurfID: turf.turf_id,
    TurfName: turf.turf_name,
    OwnerID: turf.owner_id,
    Location: turf.turf_location,
    Mobile: turf.turf_mobile_number || "",
    Status: turf.turf_active_status ? "Active" : "Inactive",
    Opened: turf.turf_opened ? "Yes" : "No",
    BookingType: turf.booking_type,
    Length: turf.turf_length,
    Breadth: turf.turf_breadth,
    Height: turf.turf_height,
    Sports: turf.available_sports_list?.join(", "),
  }));

  const ws1 = XLSX.utils.json_to_sheet(masterData);
  XLSX.utils.book_append_sheet(workbook, ws1, "Main Data");

  /* ===============================
     SHEET 2 : PRICING
  =============================== */
  const pricingData: any[] = [];

  turfs.forEach((turf) => {
    const sports = turf.available_sports_list || [];

    sports.forEach((sport: string) => {
      const price = turf.sport_specific_price?.[sport];

      if (price) {
        pricingData.push({
          TurfName: turf.turf_name,
          Sport: sport,
          Mon_Day: price.monday?.day || "",
          Mon_Night: price.monday?.night || "",
          Tue_Day: price.tuesday?.day || "",
          Tue_Night: price.tuesday?.night || "",
          Wed_Day: price.wednesday?.day || "",
          Wed_Night: price.wednesday?.night || "",
          Thu_Day: price.thursday?.day || "",
          Thu_Night: price.thursday?.night || "",
          Fri_Day: price.friday?.day || "",
          Fri_Night: price.friday?.night || "",
          Sat_Day: price.saturday?.day || "",
          Sat_Night: price.saturday?.night || "",
          Sun_Day: price.sunday?.day || "",
          Sun_Night: price.sunday?.night || "",
        });
      }
    });
  });

  const ws2 = XLSX.utils.json_to_sheet(pricingData);
  XLSX.utils.book_append_sheet(workbook, ws2, "Sport Pricing");

  /* ===============================
     SHEET 3 : TIMINGS
  =============================== */
  const timingData: any[] = [];

  turfs.forEach((turf) => {
    const sports = turf.available_sports_list || [];

    sports.forEach((sport: string) => {
      const time = turf.sport_specific_timing?.[sport];

      if (time) {
        timingData.push({
          TurfName: turf.turf_name,
          Sport: sport,
          PersonCount: turf.sports_specific_person_count?.[sport] ?? "",
          Opening: time.opening_time,
          Closing: time.closing_time,
          DayStart: time.day_start_time,
          DayEnd: time.day_end_time,
          NightStart: time.night_start_time,
          NightEnd: time.night_end_time,
          Courts: time.court_count,
        });
      }
    });
  });

  const ws3 = XLSX.utils.json_to_sheet(timingData);
  XLSX.utils.book_append_sheet(workbook, ws3, "Sport Timing");

  /* ===============================
     SHEET 4 : AMENITIES
  =============================== */
  const amenityData = turfs.map((turf) => ({
    TurfName: turf.turf_name,
    Amenities: turf.amenities?.join(", "),
  }));

  const ws4 = XLSX.utils.json_to_sheet(amenityData);
  XLSX.utils.book_append_sheet(workbook, ws4, "Amenities");

  /* ===============================
     SHEET 5 : IMAGES
  =============================== */
  const imageData = turfs.map((turf) => ({
    TurfName: turf.turf_name,
    Images: turf.turf_images?.join(" | "),
  }));

  const ws5 = XLSX.utils.json_to_sheet(imageData);
  XLSX.utils.book_append_sheet(workbook, ws5, "All Images");

  /* ===============================
     DOWNLOAD
  =============================== */
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(
    blob,
    `turfs_report_${new Date().toISOString().slice(0, 10)}.xlsx`
  );
};
