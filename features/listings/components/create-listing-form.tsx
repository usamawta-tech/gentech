"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { LISTING_CONDITION_LABELS, PK_CITIES, ROUTES } from "@/lib/constants";
import type { BrandItem, CategoryItem } from "@/types/marketplace";
import {
  createListingSchema,
  type CreateListingInput,
  type UploadedImage,
} from "@/features/listings/schemas/create-listing";
import { createListingAction } from "@/features/listings/actions/create-listing";
import { ImageUploader } from "./image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const selectClass =
  "border-input bg-background h-10 w-full rounded-md border px-3 text-sm focus-visible:ring-3 focus-visible:ring-ring/50 outline-none";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-destructive text-sm">{message}</p>;
}

export function CreateListingForm({
  categories,
  brands,
}: {
  categories: CategoryItem[];
  brands: BrandItem[];
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateListingInput>({
    resolver: zodResolver(createListingSchema),
    defaultValues: { images: [], negotiable: false, ptaApproved: false },
  });

  const images = useWatch({ control, name: "images" }) ?? [];

  function setImages(next: UploadedImage[]) {
    setValue("images", next, { shouldValidate: true });
  }

  async function onSubmit(values: CreateListingInput) {
    const result = await createListingAction(values);
    if (!result.ok) {
      toast.error(result.error ?? "Could not create the listing.");
      return;
    }
    toast.success("Your listing is live!");
    router.push(result.slug ? `/listings/${result.slug}` : ROUTES.dashboard);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      {/* Photos */}
      <section className="space-y-2">
        <Label>Photos</Label>
        <ImageUploader value={images} onChange={setImages} />
        <FieldError message={errors.images?.message} />
      </section>

      {/* Basics */}
      <section className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="e.g. iPhone 15 Pro Max 256GB — PTA Approved"
            {...register("title")}
          />
          <FieldError message={errors.title?.message} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={5}
            placeholder="Condition, warranty, accessories included, reason for selling…"
            {...register("description")}
          />
          <FieldError message={errors.description?.message} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="price">Price (PKR)</Label>
            <Input
              id="price"
              type="number"
              inputMode="numeric"
              placeholder="84999"
              {...register("price", { valueAsNumber: true })}
            />
            <FieldError message={errors.price?.message} />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4" {...register("negotiable")} />
              Price is negotiable
            </label>
          </div>
        </div>
      </section>

      {/* Classification */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="categorySlug">Category</Label>
          <select
            id="categorySlug"
            className={selectClass}
            defaultValue=""
            {...register("categorySlug")}
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.categorySlug?.message} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="brandSlug">Brand (optional)</Label>
          <select id="brandSlug" className={selectClass} defaultValue="" {...register("brandSlug")}>
            <option value="">No brand</option>
            {brands.map((b) => (
              <option key={b.id} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="condition">Condition</Label>
          <select id="condition" className={selectClass} defaultValue="" {...register("condition")}>
            <option value="" disabled>
              Select condition
            </option>
            {Object.entries(LISTING_CONDITION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <FieldError message={errors.condition?.message} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="city">City</Label>
          <select id="city" className={selectClass} defaultValue="" {...register("city")}>
            <option value="" disabled>
              Select a city
            </option>
            {PK_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <FieldError message={errors.city?.message} />
        </div>

        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="area">Area / neighbourhood (optional)</Label>
          <Input id="area" placeholder="e.g. DHA Phase 6" {...register("area")} />
        </div>
      </section>

      {/* Phone specs */}
      <section className="grid gap-4">
        <h3 className="text-sm font-semibold">Specifications (optional)</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="storage">Storage</Label>
            <Input id="storage" placeholder="256GB" {...register("storage")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ram">RAM</Label>
            <Input id="ram" placeholder="8GB" {...register("ram")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="color">Color</Label>
            <Input id="color" placeholder="Titanium Blue" {...register("color")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="batteryHealth">Battery health (%)</Label>
            <Input
              id="batteryHealth"
              inputMode="numeric"
              placeholder="92"
              {...register("batteryHealth")}
            />
            <FieldError message={errors.batteryHealth?.message} />
          </div>
          <div className="flex items-end pb-2 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4" {...register("ptaApproved")} />
              PTA approved
            </label>
          </div>
        </div>
      </section>

      <Button type="submit" size="lg" disabled={isSubmitting} className={cn("w-full sm:w-auto")}>
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Publish listing
      </Button>
    </form>
  );
}
