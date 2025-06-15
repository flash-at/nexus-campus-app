
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, QrCode, Fingerprint, History } from "lucide-react";

const StaffPointBalance = ({ balance }: { balance: number }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Your Point Balance</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{balance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Points remaining to allocate</p>
        </CardContent>
    </Card>
);

const QrScannerTab = () => (
    <div className="text-center p-8 border-2 border-dashed rounded-lg">
        <QrCode className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">QR Code scanner will be implemented here.</p>
    </div>
);

const ManualEntryTab = () => (
     <div className="text-center p-8 border-2 border-dashed rounded-lg">
        <Fingerprint className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Manual Hall Ticket entry will be implemented here.</p>
    </div>
);

export const PointsPortal = () => {
    // Hardcoded for now, will be fetched later.
    const staffPointBalance = 1000;

    return (
        <div className="w-full max-w-4xl space-y-6 animate-fade-in p-4 sm:p-0">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Staff Points Portal</h1>
                <p className="text-muted-foreground">Allocate activity points to students.</p>
            </div>
            
            <StaffPointBalance balance={staffPointBalance} />

            <Tabs defaultValue="qr-scanner" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="qr-scanner">
                        <QrCode className="mr-2 h-4 w-4"/>
                        Scan QR Code
                    </TabsTrigger>
                    <TabsTrigger value="manual-entry">
                        <Fingerprint className="mr-2 h-4 w-4"/>
                        Manual Entry
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="qr-scanner" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Scan Student QR Code</CardTitle>
                            <CardDescription>Use your device camera to scan the student's Digital ID.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <QrScannerTab />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="manual-entry" className="mt-6">
                    <Card>
                         <CardHeader>
                            <CardTitle>Enter Hall Ticket Number</CardTitle>
                            <CardDescription>Manually enter student details to award points.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ManualEntryTab />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <History className="mr-2 h-5 w-5" />
                            Your Recent Transactions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-center p-4">Transaction history will appear here.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
