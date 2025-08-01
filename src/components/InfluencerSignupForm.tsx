import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

const followerRanges = [
  "10,000-25,000",
  "25,000-50,000",
  "50,000-80,000",
  "80,000-100,000",
  "100,000-500,000",
  "500,000+"
];

const products = [
  "Blankets",
  "Photobooks", 
  "Canvas",
  "Calendars",
  "Framed Prints",
  "Metal Prints"
];

const formSchema = z.object({
  instagramUsername: z.string()
    .min(1, "Instagram username is required")
    .regex(/^@?[a-zA-Z0-9._]+$/, "Please enter a valid Instagram username"),
  followerCount: z.string().min(1, "Please select your follower count range"),
  trafficRange: z.string().min(1, "Please select your traffic range"),
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  productsToPromote: z.string().min(1, "Please select a product"),
  countryOfResidence: z.string().min(1, "Please select your country of residence"),
  followersLocation: z.string().min(1, "Please select where most of your followers are based"),
});

type FormData = z.infer<typeof formSchema>;

export const InfluencerSignupForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
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
      productsToPromote: "",
    },
  });

  const watchedValues = watch();

  const handleProductSelect = (product: string) => {
    setSelectedProduct(product);
    setValue("productsToPromote", product);
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

      // Submit to Supabase via edge function
      const response = await fetch(
        "https://rrbbkiaguqmcgwvibiqv.supabase.co/functions/v1/submit-influencer-form",
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
      setSelectedProduct("");
      
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

        {/* Introductory Paragraph */}
        <div className="text-center mb-6 p-4 bg-card rounded-lg border shadow-soft">
          <p className="text-foreground leading-relaxed">
            Thank you for your interest in collaborating with Printerpix!<br />
            We love working with creative influencers and are excited to explore a barter collaboration with you.<br />
            You can switch to your local region or preferred language using the section below this form.
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
                <Label className="flex items-center gap-2 font-medium">
                  <Users className="w-4 h-4 text-instagram-pink" />
                  Follower Count
                </Label>
                <Select onValueChange={(value) => setValue("followerCount", value)}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select your follower count range" />
                  </SelectTrigger>
                  <SelectContent>
                    {followerRanges.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                   Where &gt;50% of Your Followers Are Based
                 </Label>
                 <Select onValueChange={(value) => setValue("followersLocation", value)}>
                   <SelectTrigger className="h-12 text-base">
                     <SelectValue placeholder="Select Main Location" />
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
                 <RadioGroup value={selectedProduct} onValueChange={handleProductSelect}>
                   <div className="grid grid-cols-2 gap-3">
                     {products.map((product) => (
                         <div
                           key={product}
                           className={`p-3 rounded-lg border transition-all ${
                             selectedProduct === product
                               ? "border-instagram-purple bg-gradient-subtle"
                               : "border-border hover:border-instagram-purple/50"
                           }`}
                         >
                           <div className="flex items-center space-x-2">
                             <RadioGroupItem value={product} id={product} />
                             <Label 
                               htmlFor={product}
                               className="text-sm font-medium cursor-pointer flex-1"
                             >
                               {product}
                             </Label>
                           </div>
                         </div>
                     ))}
                   </div>
                 </RadioGroup>
                 {errors.productsToPromote && (
                   <p className="text-sm text-destructive">{errors.productsToPromote.message}</p>
                 )}
               </div>

               {/* Contact Notice */}
               <div className="space-y-3">
                 <p className="text-sm leading-5 text-muted-foreground">
                   We will be contacting you by email
                 </p>
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

        {/* Regional Sites Section */}
        <div className="mt-8 p-6 bg-card rounded-lg border shadow-soft">
          <h3 className="text-lg font-semibold text-center mb-4">
            Country of residence? Click below to visit your regional site:
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <a
              href="https://www.printerpix.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <span className="text-2xl mb-1">india flag</span>
              <span className="text-sm font-medium text-center">India</span>
            </a>
            <a
              href="https://www.printerpix.de"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <span className="text-2xl mb-1">🇩🇪</span>
              <span className="text-sm font-medium text-center">Germany</span>
            </a>
            <a
              href="https://www.printerpix.it"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <span className="text-2xl mb-1">🇮🇹</span>
              <span className="text-sm font-medium text-center">Italy</span>
            </a>
            <a
              href="https://www.printerpix.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <span className="text-2xl mb-1">🇺🇸</span>
              <span className="text-sm font-medium text-center">United States</span>
            </a>
            <a
              href="https://www.printerpix.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <span className="text-2xl mb-1">🇬🇧</span>
              <span className="text-sm font-medium text-center">United Kingdom</span>
            </a>
            <a
              href="https://www.printerpix.es"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <span className="text-2xl mb-1">🇪🇸</span>
              <span className="text-sm font-medium text-center">Spain</span>
            </a>
            <a
              href="https://www.printerpix.nl"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <span className="text-2xl mb-1">🇳🇱</span>
              <span className="text-sm font-medium text-center">Netherlands</span>
            </a>
            <a
              href="https://www.printerpix.ae"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <span className="text-2xl mb-1">🇦🇪</span>
              <span className="text-sm font-medium text-center">UAE</span>
            </a>
            <a
              href="https://www.printerpix.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <span className="text-2xl mb-1">🇫🇷</span>
              <span className="text-sm font-medium text-center">France</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};