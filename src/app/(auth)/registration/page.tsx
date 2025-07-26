"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@iconify/react";
import { ModeToggle } from "@/components/reuseable/page-components/ModeToggle";

const RegistrationPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-blue-300/20 dark:bg-c1">
      <div className="container mx-auto lg:p-4 p-2 max-w-4xl flex-1 flex flex-col gap-6 z-10">
        <div className="relative w-fit h-fit rounded-lg overflow-hidden group">
          <div className="z-10 group-hover:bg-black/30 duration-300 w-full h-full absolute"></div>
          <img
            src="/images/beacon-reg.png"
            className=" object-contain"
            alt=""
          />
          <div className="w-fit h-fit absolute bottom-4 right-4 z-20">
            <ModeToggle />
          </div>
        </div>
        
        <Card className="relative flex-1 flex flex-col h-full lg:p-8 p-4 dark:bg-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl uppercase mb-2">
              BEACON 2025 Registration
            </CardTitle>
            <div className="w-24 max-w-24 border-c1 border-2 rounded-full h-1 bg-c1 mx-auto"></div>
            <CardDescription className="text-lg mt-4">
              Choose your registration type to get started
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
              
              {/* Visitor Registration */}
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-c1">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 w-16 h-16 bg-c1/10 rounded-full flex items-center justify-center group-hover:bg-c1/20 transition-colors">
                    <Icon 
                      icon="mdi:account-group" 
                      className="w-8 h-8 text-c1"
                    />
                  </div>
                  <CardTitle className="text-xl">Visitor Registration</CardTitle>
                  <CardDescription>
                    Register as a general visitor to attend the conference, exhibitions, and shows
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Conference access</p>
                    <p>• Philippine In-Water Ship & Boat Show</p>
                    <p>• Blue Runway Fashion Show</p>
                    <p>• Networking & Awards Night</p>
                  </div>
                  <Link href="/registration/visitor" className="block">
                    <Button className="w-full" size="lg">
                      Register as Visitor
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Exhibitor Registration */}
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-c1">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 w-16 h-16 bg-c1/10 rounded-full flex items-center justify-center group-hover:bg-c1/20 transition-colors">
                    <Icon 
                      icon="mdi:store" 
                      className="w-8 h-8 text-c1"
                    />
                  </div>
                  <CardTitle className="text-xl">Exhibitor Registration</CardTitle>
                  <CardDescription>
                    Register as an exhibitor to showcase your products and services
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Exhibition booth space</p>
                    <p>• Product showcase opportunities</p>
                    <p>• Networking with industry leaders</p>
                    <p>• Marketing and branding exposure</p>
                  </div>
                  <Link href="/registration/exhibitor" className="block">
                    <Button className="w-full" size="lg" variant="outline">
                      Register as Exhibitor
                    </Button>
                  </Link>
                </CardContent>
              </Card>

            </div>

            {/* Conference Registration Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Looking for conference-specific registration?
              </p>
              <Link href="/registration/conference">
                <Button variant="ghost" className="underline">
                  Conference Registration →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegistrationPage;
