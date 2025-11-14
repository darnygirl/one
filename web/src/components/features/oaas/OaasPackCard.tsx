/**
 * OaaS Pack Card Component (Cycles 87-88)
 *
 * Displays pack in marketplace with pricing, ROI, and social proof
 */

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, Zap, Clock, DollarSign, Users } from "lucide-react";
import type { PaymentOffer } from "@/lib/effect/oaasClient";

export interface OaasPack {
  id: string;
  name: string;
  description: string;
  image?: string;
  offer: PaymentOffer;
  category: "ontology" | "playbook" | "premium";
}

interface OaasPackCardProps {
  pack: OaasPack;
  onTryFree?: (packId: string) => void;
  onBuy?: (packId: string) => void;
  showDetails?: (packId: string) => void;
}

export function OaasPackCard({ pack, onTryFree, onBuy, showDetails }: OaasPackCardProps) {
  const { offer } = pack;
  const expectedGains = offer.expected_gains;
  const proofOfValue = offer.proof_of_value;
  const freeTrial = offer.free_trial_calls || 0;

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      {/* Pack Image */}
      {pack.image && (
        <div className="h-48 overflow-hidden rounded-t-lg bg-gradient-to-br from-blue-50 to-purple-50">
          <img src={pack.image} alt={pack.name} className="w-full h-full object-cover" />
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-xl">{pack.name}</CardTitle>
            <CardDescription className="mt-1">{pack.description}</CardDescription>
          </div>
          <CategoryBadge category={pack.category} />
        </div>

        {/* Pricing */}
        <div className="mt-4 space-y-2">
          <div className="flex items-baseline gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-3xl font-bold">${offer.price_usdc}</span>
            <span className="text-muted-foreground">/call</span>
          </div>

          {offer.monthly_unlimited && (
            <div className="text-sm text-muted-foreground">
              or <strong>${offer.monthly_unlimited}/mo</strong> unlimited
            </div>
          )}

          {freeTrial > 0 && (
            <Badge variant="secondary" className="text-xs">
              🎁 {freeTrial} free calls available
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Expected Gains */}
        {expectedGains && (
          <div className="grid grid-cols-2 gap-3">
            <MetricBadge
              icon={<TrendingUp className="h-4 w-4" />}
              label="Accuracy"
              value={`+${(expectedGains.accuracy_pct * 100).toFixed(0)}%`}
              color="text-blue-600"
            />
            <MetricBadge
              icon={<DollarSign className="h-4 w-4" />}
              label="Saves"
              value={`$${expectedGains.cost_savings_usd}`}
              color="text-green-600"
            />
            <MetricBadge
              icon={<Clock className="h-4 w-4" />}
              label="Time"
              value={`${expectedGains.time_saved_hours}h`}
              color="text-purple-600"
            />
            <MetricBadge
              icon={<Zap className="h-4 w-4" />}
              label="ROI"
              value={`${expectedGains.roi_multiple}×`}
              color="text-orange-600"
            />
          </div>
        )}

        {/* Social Proof */}
        {proofOfValue && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground border-t pt-3">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{proofOfValue.agents_using} agents</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{proofOfValue.satisfaction_score.toFixed(1)}</span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {freeTrial > 0 && onTryFree && (
          <Button variant="outline" onClick={() => onTryFree(pack.id)} className="flex-1">
            Try {freeTrial} Free
          </Button>
        )}
        {onBuy && (
          <Button onClick={() => onBuy(pack.id)} className="flex-1">
            Buy Now
          </Button>
        )}
        {showDetails && (
          <Button variant="ghost" onClick={() => showDetails(pack.id)}>
            Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// Helper Components

function CategoryBadge({ category }: { category: OaasPack["category"] }) {
  const config = {
    ontology: { label: "Ontology", color: "bg-blue-100 text-blue-700" },
    playbook: { label: "Playbook", color: "bg-purple-100 text-purple-700" },
    premium: { label: "Premium", color: "bg-orange-100 text-orange-700" },
  };

  const { label, color } = config[category];

  return <Badge className={color}>{label}</Badge>;
}

function MetricBadge({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/20">
      <div className={color}>{icon}</div>
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`text-sm font-bold ${color}`}>{value}</div>
      </div>
    </div>
  );
}
