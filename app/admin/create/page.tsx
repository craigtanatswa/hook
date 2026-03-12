import { AdvertForm } from "@/components/advert-form";

export default function CreateAdvertPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-foreground">Create Advert</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the details below to post a new service advert.
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
        <AdvertForm submitLabel="Post Advert" />
      </div>
    </div>
  );
}
