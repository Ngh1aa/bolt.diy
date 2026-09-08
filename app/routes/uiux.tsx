import type { MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { FactoryWorkbench } from '~/components/uiux-factory/FactoryWorkbench.client';
import '~/styles/uiux-factory.css';

export const meta: MetaFunction = () => {
  return [
    { title: 'UIUX Factory — Design Workbench' },
    {
      name: 'description',
      content: 'Skill-driven website design workbench powered by Bolt.diy + MetaGPT + skills_UIUX',
    },
  ];
};

export default function UIUXFactoryRoute() {
  return (
    <ClientOnly
      fallback={
        <div className="uf-shell uf-loading">
          <div className="uf-loading-mark" />
          <p>Loading UIUX Factory…</p>
        </div>
      }
    >
      {() => <FactoryWorkbench />}
    </ClientOnly>
  );
}
