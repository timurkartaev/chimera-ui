import { CardLayout } from './card_layout';

export function SkeletonCard() {
  return (
    <CardLayout
      logo={<div className="w-full h-full bg-gray-200" />}
      name={
        <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto" />
      }
      metaLeft={<div className="h-3 bg-gray-200 rounded w-3/4" />}
      metaRight={<div className="h-3 bg-gray-200 rounded w-2/4" />}
      footerLeft={<div className="h-4 bg-gray-200 rounded w-3/5" />}
      footerRight={<div className="h-6 w-14 bg-gray-200 rounded-full" />}
    />
  );
}
