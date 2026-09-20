import { PageHeader } from '@/components/page-header';
import { FinanceCalendar } from '@/components/finance-calendar';
export default function CalendarPage(){return <><PageHeader eyebrow="Échéances" title="Calendrier financier" subtitle="Visualisez dans le temps les dépenses planifiées, dettes et créances."/><FinanceCalendar/></>}
