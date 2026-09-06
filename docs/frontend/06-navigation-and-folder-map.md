# Frontend Route-to-Component Map

## Public
`/`
- SiteHeader
- HeroSearch
- TrustStrip
- FeaturedModels
- WhyChooseSection
- HowItWorks
- ReviewSection
- ContactSection
- SiteFooter

`/search`
- SearchSummary
- FilterBar (minimal V1)
- ModelResultGrid
- EmptyState

`/models/[modelId]`
- ModelGallery
- ModelSummary
- SpecsGrid
- AvailabilitySummary
- PolicySummary
- RequestBooking CTA

`/request/[modelId]`
- BookingSummary
- CustomerDetailsForm
- PolicyAcknowledgement
- SubmitRequest

`/request/success`
- RequestSuccess
- ReferenceCard
- StatusLinkCard
- ContactBusiness CTA

`/status/[token]`
- StatusTimeline
- ScheduleCard
- BusinessContactCard

## Owner
`/owner`
- OwnerShell
- ActionRequired
- TodaySummary
- FleetSummary
- UpcomingSchedule

`/owner/bookings`
- BookingFilters
- BookingTable/List
- EmptyState

`/owner/bookings/[bookingId]`
- BookingCustomerCard
- RequestedScheduleCard
- ConfirmedScheduleEditor
- VehicleSuggestionPanel
- BookingActions
- BookingHistory

`/owner/calendar`
- CalendarToolbar
- WeekCalendar
- DayDetailPanel
- MonthNavigator

`/owner/fleet`
- ModelList
- AddModel CTA

`/owner/fleet/models/[modelId]`
- ModelEditor
- PhysicalVehicleList
- ModelGalleryManager

`/owner/fleet/vehicles/[vehicleId]`
- VehicleEditor
- VehicleImageManager
- VehicleBookings
- BlockVehicle action

`/owner/reports`
- ReportFilters
- ReportSummary
- ExportCSV

`/owner/settings`
- BusinessProfileForm
- HoursForm
- ContentForm
- PolicyForm
- WhatsAppSettings
- AnalyticsSettings
