
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { User, Building, Target, Users, FileText } from 'lucide-react';

const ProfileHub = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 border-primary"
        >
          <User className="w-4 h-4 mr-2" />
          Profile & Autofill Hub
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Profile & Autofill Hub</SheetTitle>
          <SheetDescription>
            Build your comprehensive profile to power intelligent autofill and AI analysis
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          <Tabs defaultValue="organization" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="organization" className="flex items-center gap-1">
                <Building className="w-3 h-3" />
                <span className="hidden sm:inline">Organization</span>
              </TabsTrigger>
              <TabsTrigger value="pitch" className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span className="hidden sm:inline">Pitch</span>
              </TabsTrigger>
              <TabsTrigger value="market" className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                <span className="hidden sm:inline">Market</span>
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span className="hidden sm:inline">Team</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span className="hidden sm:inline">Docs</span>
              </TabsTrigger>
            </TabsList>

            {/* Organization Tab */}
            <TabsContent value="organization" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Organization Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input id="company-name" placeholder="Enter your company name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website URL</Label>
                      <Input id="website" placeholder="https://yourcompany.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Company Location</Label>
                      <Input id="location" placeholder="City, State/Country" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-type">Company Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="for-profit">For-Profit (C-Corp, LLC, etc.)</SelectItem>
                          <SelectItem value="non-profit">Non-Profit (501(c)(3), etc.)</SelectItem>
                          <SelectItem value="academic">Academic/University</SelectItem>
                          <SelectItem value="individual">Individual Researcher</SelectItem>
                          <SelectItem value="student">Student Project</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax-id">Tax ID / EIN</Label>
                    <Input id="tax-id" placeholder="Enter your Tax ID or EIN" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pitch Tab */}
            <TabsContent value="pitch" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pitch & Narrative</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Company Description (Tagline)</Label>
                    <Input id="tagline" placeholder="One-sentence description (140 chars max)" maxLength={140} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="problem">Problem You Solve</Label>
                    <Textarea id="problem" placeholder="Detailed description of the pain point" rows={4} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="solution">How You Solve It</Label>
                    <Textarea id="solution" placeholder="Detailed description of your product/service" rows={4} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="uvp">Unique Value Proposition</Label>
                    <Textarea id="uvp" placeholder="What makes you different" rows={3} />
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Project Summaries (Autofill Gold)</h4>
                    <div className="space-y-2">
                      <Label htmlFor="elevator-pitch">Elevator Pitch (50 Words)</Label>
                      <Textarea id="elevator-pitch" placeholder="Very short summary" rows={2} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="standard-abstract">Standard Abstract (250 Words)</Label>
                      <Textarea id="standard-abstract" placeholder="Most common length" rows={4} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="detailed-summary">Detailed Summary (500 Words)</Label>
                      <Textarea id="detailed-summary" placeholder="For in-depth sections" rows={6} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mission-vision">Mission & Vision</Label>
                    <Textarea id="mission-vision" placeholder="Long-term view" rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="impact">Potential Impact</Label>
                    <Textarea id="impact" placeholder="The 'so what?' of your project" rows={3} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Market Tab */}
            <TabsContent value="market" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Market & Traction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry / Sector</Label>
                    <Input id="industry" placeholder="Your industry (multiple selections allowed)" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target-market">Target Market</Label>
                    <Textarea id="target-market" placeholder="Ideal customer profile" rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="competitors">Competitor Landscape</Label>
                    <Textarea id="competitors" placeholder="Key competitors and differentiators" rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="traction">Key Traction & Milestones</Label>
                    <Textarea id="traction" placeholder="Users, revenue, partnerships, growth metrics" rows={4} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team & Financials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="team-size">Team Size</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 person</SelectItem>
                          <SelectItem value="2-5">2-5 people</SelectItem>
                          <SelectItem value="6-10">6-10 people</SelectItem>
                          <SelectItem value="11-50">11-50 people</SelectItem>
                          <SelectItem value="50+">50+ people</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="funding-stage">Funding Stage</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select funding stage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                          <SelectItem value="seed">Seed</SelectItem>
                          <SelectItem value="series-a">Series A</SelectItem>
                          <SelectItem value="series-b">Series B</SelectItem>
                          <SelectItem value="growth">Growth</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="team-bios">Founder & Team Bios</Label>
                    <Textarea id="team-bios" placeholder="Brief bios for key members (100-word and 250-word versions recommended)" rows={6} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-revenue">Current Revenue (MRR)</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select revenue range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">$0</SelectItem>
                          <SelectItem value="1-10k">$1-10K</SelectItem>
                          <SelectItem value="10-50k">$10-50K</SelectItem>
                          <SelectItem value="50-100k">$50-100K</SelectItem>
                          <SelectItem value="100k+">$100K+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="funding-goal">Funding Goal</Label>
                      <Input id="funding-goal" placeholder="Target funding amount" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="previous-funding">Previous Funding Raised</Label>
                    <Textarea id="previous-funding" placeholder="Details of previous funding rounds" rows={3} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="use-of-funds">Use of Funds</Label>
                    <Textarea id="use-of-funds" placeholder="Detailed breakdown of how new funding will be used" rows={4} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Documents & Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Document Uploads</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pitch-deck">Pitch Deck (PDF)</Label>
                        <Input id="pitch-deck" type="file" accept=".pdf" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business-plan">Business Plan / Whitepaper (PDF)</Label>
                        <Input id="business-plan" type="file" accept=".pdf" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="supporting-docs">Supporting Documents</Label>
                        <Input id="supporting-docs" type="file" multiple />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Important Links</h4>
                    <div className="space-y-2">
                      <Label htmlFor="demo-video">Product Demo Video URL</Label>
                      <Input id="demo-video" placeholder="YouTube, Loom, etc." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn Company Page URL</Label>
                      <Input id="linkedin" placeholder="https://linkedin.com/company/..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="press-kit">Press/Media Kit URL</Label>
                      <Input id="press-kit" placeholder="Link to press resources" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              Save Profile
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileHub;
