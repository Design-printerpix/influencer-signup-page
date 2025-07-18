import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Instagram, Users, Mail, Package, Globe } from "lucide-react";

const countries = [
  "United Kingdom",
  "United States", 
  "France",
  "Germany",
  "Italy",
  "Spain",
  "India",
  "United Arab Emirates",
  "Netherlands"
];

const trafficRanges = [
  "Under 1,000",
  "1,000 – 5,000", 
  "5,000 – 10,000",
  "10,000 – 50,000",
  "50,000 – 100,000",
  "100,000 – 500,000",
  "500,000 – 1,000,000+"
];

const products = [
  "Blankets",
  "Photobooks", 
  "Canvas",
  "Mugs",
  "Framed Prints",
  "Metal Prints"
];

const formSchema = z.object({
  instagramUsername: z.string()
    .min(1, "Instagram username is required")
    .regex(/^@?[a-zA-Z0-9._]+$/, "Please enter a valid Instagram username"),
  followerCount: z.number()
    .min(1, "Follower count is required")
    .int("Please enter a whole number"),
  trafficRange: z.string().min(1, "Please select your traffic range"),
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  productsToPromote: z.array(z.string())
    .min(1, "Please select at least one product"),
  countryOfResidence: z.string().min(1, "Please select your country of residence"),
  followersLocation: z.string().min(1, "Please select where most of your followers are based"),
  consent: z.boolean().refine(val => val === true, "You must agree to be contacted"),
});

type FormData = z.infer<typeof formSchema>;

export const InfluencerSignupForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productsToPromote: [],
      consent: false,
    },
  });

  const watchedValues = watch();

  const handleProductToggle = (product: string) => {
    const updated = selectedProducts.includes(product)
      ? selectedProducts.filter(p => p !== product)
      : [...selectedProducts, product];
    
    setSelectedProducts(updated);
    setValue("productsToPromote", updated);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Format username to ensure it starts with @
      const formattedUsername = data.instagramUsername.startsWith('@') 
        ? data.instagramUsername 
        : `@${data.instagramUsername}`;

      const submissionData = {
        ...data,
        instagramUsername: formattedUsername,
        timestamp: new Date().toISOString(),
      };

      // Submit to Google Sheets via edge function
      const response = await fetch(
        "https://iprombyqmubcnldhcvju.supabase.co/functions/v1/submit-influencer-form",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submissionData),
        }
      );

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit form");
      }
      
      toast({
        title: "Application Submitted! 🎉",
        description: "Thanks for your interest! We'll review your application and get back to you soon.",
      });

      reset();
      setSelectedProducts([]);
      
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Oops, something went wrong!",
        description: "Please try submitting again. If the problem persists, contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-md mx-auto pt-8 pb-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-instagram rounded-full flex items-center justify-center mx-auto mb-4 shadow-hover-lift">
            <Instagram className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Hey influencer! 👋
          </h1>
          <p className="text-muted-foreground text-base">
            We'd love to learn more about you 👇
          </p>
        </div>

        {/* Form */}
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardHeader className="pb-4">
            <div className="text-center">
              <h2 className="text-lg font-semibold">Let's Collaborate!</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Instagram Username */}
              <div className="space-y-2">
                <Label htmlFor="instagramUsername" className="flex items-center gap-2 font-medium">
                  <Instagram className="w-4 h-4 text-instagram-purple" />
                  Instagram Username
                </Label>
                <Input
                  id="instagramUsername"
                  placeholder="@yourhandle"
                  {...register("instagramUsername")}
                  className="h-12 text-base"
                />
                {errors.instagramUsername && (
                  <p className="text-sm text-destructive">{errors.instagramUsername.message}</p>
                )}
              </div>

              {/* Follower Count */}
              <div className="space-y-2">
                <Label htmlFor="followerCount" className="flex items-center gap-2 font-medium">
                  <Users className="w-4 h-4 text-instagram-pink" />
                  Follower Count
                </Label>
                <Input
                  id="followerCount"
                  type="number"
                  placeholder="e.g. 10,000"
                  {...register("followerCount", { valueAsNumber: true })}
                  className="h-12 text-base"
                />
                {errors.followerCount && (
                  <p className="text-sm text-destructive">{errors.followerCount.message}</p>
                )}
              </div>

              {/* Traffic Range */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-medium">
                  <Users className="w-4 h-4 text-instagram-orange" />
                  Traffic on Profile
                </Label>
                <Select onValueChange={(value) => setValue("trafficRange", value)}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select your traffic range" />
                  </SelectTrigger>
                  <SelectContent>
                    {trafficRanges.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.trafficRange && (
                  <p className="text-sm text-destructive">{errors.trafficRange.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 font-medium">
                  <Mail className="w-4 h-4 text-instagram-purple" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  {...register("email")}
                  className="h-12 text-base"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Country of Residence */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-medium">
                  <Globe className="w-4 h-4 text-instagram-pink" />
                  Country of Residence
                </Label>
                <Select onValueChange={(value) => setValue("countryOfResidence", value)}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.countryOfResidence && (
                  <p className="text-sm text-destructive">{errors.countryOfResidence.message}</p>
                )}
              </div>

              {/* Followers Location */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-medium">
                  <Globe className="w-4 h-4 text-instagram-orange" />
                  Where Most of Your Followers Are Based
                </Label>
                <Select onValueChange={(value) => setValue("followersLocation", value)}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select followers' main location" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.followersLocation && (
                  <p className="text-sm text-destructive">{errors.followersLocation.message}</p>
                )}
              </div>

              {/* Products to Promote */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 font-medium">
                  <Package className="w-4 h-4 text-instagram-purple" />
                  Pick a Free Product to Promote
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {products.map((product) => (
                      <div
                        key={product}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedProducts.includes(product)
                            ? "border-instagram-purple bg-gradient-subtle"
                            : "border-border hover:border-instagram-purple/50"
                        }`}
                        onClick={() => handleProductToggle(product)}
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedProducts.includes(product)}
                            onCheckedChange={() => handleProductToggle(product)}
                          />
                          <span className="text-sm font-medium">{product}</span>
                        </div>
                      </div>
                  ))}
                </div>
                {errors.productsToPromote && (
                  <p className="text-sm text-destructive">{errors.productsToPromote.message}</p>
                )}
              </div>

              {/* Consent */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent"
                    checked={watchedValues.consent}
                    onCheckedChange={(checked) => setValue("consent", !!checked)}
                  />
                  <Label
                    htmlFor="consent"
                    className="text-sm leading-5 cursor-pointer"
                  >
                    I agree to be contacted via email
                  </Label>
                </div>
                {errors.consent && (
                  <p className="text-sm text-destructive">{errors.consent.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="instagram"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Let's Collab 🚀
                  </>
                )}
              </Button>

              {/* Privacy Note */}
              <p className="text-sm text-muted-foreground text-center mt-4">
                Your info stays private and secure – we don't spam.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};