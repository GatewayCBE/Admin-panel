# Turf Slot Booking Flow

```mermaid
flowchart TD
    A[User visits turf booking site/app] --> B[Selects location/date/time]
    B --> C[Displays list of available turfs]
    C --> D[User selects a turf]
    D --> E[Fetch available slots for selected turf]
    E --> F[User selects a slot]
    F --> G[Check if slot is still available]
    
    G -- Yes --> H[Book the slot]
    H --> I[Assign booking to user and turf owner]
    I --> J[Send confirmation to user and owner]
    J --> K[Done]

    G -- No --> L[Show error: Slot already booked]
    L --> B
