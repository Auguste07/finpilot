import { PageHeader } from '@/components/page-header';
import { ForecastPlanner } from '@/components/forecast-planner';

export default function Forecast(){
  return <>
    <PageHeader eyebrow="Scénarios & allocation" title="Prévisions financières" subtitle="Simulez les entrées futures, répartissez-les par pourcentage et planifiez les dépenses récurrentes avec une logique temporelle précise."/>
    <ForecastPlanner/>
  </>;
}
