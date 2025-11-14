/**
 * Risk Scorecard Component
 *
 * DeFi protocol risk assessment with:
 * - Protocol audit score
 * - Smart contract risk
 * - Liquidity risk
 * - Team & governance
 * - Historical exploits
 * - Overall risk score (0-100)
 * - Risk factors breakdown
 * - Comparison with similar protocols
 */

import { useState, useEffect } from "react";
import { Effect } from "effect";
import {
  calculateRiskScore,
  type RiskScorecard as RiskScorecardType,
  type RiskFactors,
} from "@/lib/services/crypto/AdvancedDeFiService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Protocol {
  name: string;
  tvl: number;
  launchDate: Date;
  hasAudit: boolean;
  auditFirms: string[];
  teamKnown: boolean;
  hasInsurance: boolean;
  exploitHistory: number;
}

const SAMPLE_PROTOCOLS: Protocol[] = [
  {
    name: "Aave V3",
    tvl: 5000000000,
    launchDate: new Date("2022-03-16"),
    hasAudit: true,
    auditFirms: ["OpenZeppelin", "Trail of Bits", "ABDK"],
    teamKnown: true,
    hasInsurance: true,
    exploitHistory: 0,
  },
  {
    name: "Compound",
    tvl: 3000000000,
    launchDate: new Date("2018-09-27"),
    hasAudit: true,
    auditFirms: ["OpenZeppelin", "Trail of Bits"],
    teamKnown: true,
    hasInsurance: true,
    exploitHistory: 0,
  },
  {
    name: "Curve Finance",
    tvl: 4000000000,
    launchDate: new Date("2020-01-10"),
    hasAudit: true,
    auditFirms: ["Trail of Bits"],
    teamKnown: true,
    hasInsurance: false,
    exploitHistory: 1,
  },
  {
    name: "Uniswap V3",
    tvl: 3500000000,
    launchDate: new Date("2021-05-05"),
    hasAudit: true,
    auditFirms: ["ABDK", "Trail of Bits"],
    teamKnown: true,
    hasInsurance: false,
    exploitHistory: 0,
  },
  {
    name: "Lido",
    tvl: 15000000000,
    launchDate: new Date("2020-12-17"),
    hasAudit: true,
    auditFirms: ["Quantstamp", "Sigma Prime"],
    teamKnown: true,
    hasInsurance: true,
    exploitHistory: 0,
  },
];

interface RiskScorecardProps {
  defaultProtocol?: string;
  onAssessmentComplete?: (scorecard: RiskScorecardType) => void;
}

export function RiskScorecard({
  defaultProtocol = "Aave V3",
  onAssessmentComplete,
}: RiskScorecardProps) {
  const [selectedProtocol, setSelectedProtocol] = useState(defaultProtocol);
  const [scorecard, setScorecard] = useState<RiskScorecardType | null>(null);
  const [comparing, setComparing] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<
    RiskScorecardType[]
  >([]);
  const [loading, setLoading] = useState(false);

  // Assess selected protocol
  const assessProtocol = async (protocolName: string) => {
    setLoading(true);

    try {
      const protocol = SAMPLE_PROTOCOLS.find((p) => p.name === protocolName);
      if (!protocol) {
        console.error("Protocol not found");
        return;
      }

      const result = await Effect.runPromise(
        calculateRiskScore(
          protocol.name,
          protocol.hasAudit,
          protocol.auditFirms,
          protocol.tvl,
          protocol.launchDate,
          protocol.teamKnown,
          protocol.hasInsurance,
          protocol.exploitHistory
        )
      );

      setScorecard(result);
      onAssessmentComplete?.(result);
    } catch (error) {
      console.error("Failed to assess protocol:", error);
    } finally {
      setLoading(false);
    }
  };

  // Compare with similar protocols
  const compareProtocols = async () => {
    setComparing(true);

    try {
      const results = await Promise.all(
        SAMPLE_PROTOCOLS.map((protocol) =>
          Effect.runPromise(
            calculateRiskScore(
              protocol.name,
              protocol.hasAudit,
              protocol.auditFirms,
              protocol.tvl,
              protocol.launchDate,
              protocol.teamKnown,
              protocol.hasInsurance,
              protocol.exploitHistory
            )
          )
        )
      );

      setComparisonResults(results.sort((a, b) => b.overallScore - a.overallScore));
    } catch (error) {
      console.error("Failed to compare protocols:", error);
    } finally {
      setComparing(false);
    }
  };

  useEffect(() => {
    assessProtocol(selectedProtocol);
  }, [selectedProtocol]);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "Low Risk":
        return "bg-green-600";
      case "Medium Risk":
        return "bg-yellow-600";
      case "High Risk":
        return "bg-orange-600";
      case "Very High Risk":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-4">
      {/* Protocol Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Protocol Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select Protocol</Label>
            <Select
              value={selectedProtocol}
              onValueChange={setSelectedProtocol}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SAMPLE_PROTOCOLS.map((protocol) => (
                  <SelectItem key={protocol.name} value={protocol.name}>
                    {protocol.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => assessProtocol(selectedProtocol)}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Assessing..." : "Assess Protocol"}
          </Button>
        </CardContent>
      </Card>

      {/* Risk Scorecard */}
      {scorecard && !loading && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{scorecard.protocolName}</span>
                <Badge
                  className={`${getRatingColor(scorecard.rating)} text-white`}
                >
                  {scorecard.rating}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Overall Score */}
              <div className="text-center p-6 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">
                  Overall Risk Score
                </div>
                <div className="text-5xl font-bold">
                  {scorecard.overallScore}
                  <span className="text-2xl text-muted-foreground">/100</span>
                </div>
                <Progress
                  value={scorecard.overallScore}
                  className="mt-4"
                />
              </div>

              <Separator />

              {/* Risk Factors Breakdown */}
              <div>
                <h4 className="font-semibold mb-3">Risk Factors</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium">Audit Score</div>
                      <div className="text-xs text-muted-foreground">
                        Security audits by reputable firms
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-lg font-bold ${getScoreColor(
                          scorecard.factors.auditScore,
                          30
                        )}`}
                      >
                        {scorecard.factors.auditScore}
                      </span>
                      <span className="text-muted-foreground">/30</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium">TVL Score</div>
                      <div className="text-xs text-muted-foreground">
                        Total value locked indicates trust
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-lg font-bold ${getScoreColor(
                          scorecard.factors.tvlScore,
                          20
                        )}`}
                      >
                        {scorecard.factors.tvlScore}
                      </span>
                      <span className="text-muted-foreground">/20</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium">Longevity Score</div>
                      <div className="text-xs text-muted-foreground">
                        Time since launch
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-lg font-bold ${getScoreColor(
                          scorecard.factors.longevityScore,
                          15
                        )}`}
                      >
                        {scorecard.factors.longevityScore}
                      </span>
                      <span className="text-muted-foreground">/15</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium">Team Score</div>
                      <div className="text-xs text-muted-foreground">
                        Doxxed and reputable team
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-lg font-bold ${getScoreColor(
                          scorecard.factors.teamScore,
                          15
                        )}`}
                      >
                        {scorecard.factors.teamScore}
                      </span>
                      <span className="text-muted-foreground">/15</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium">Insurance Score</div>
                      <div className="text-xs text-muted-foreground">
                        Insurance coverage available
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-lg font-bold ${getScoreColor(
                          scorecard.factors.insuranceScore,
                          10
                        )}`}
                      >
                        {scorecard.factors.insuranceScore}
                      </span>
                      <span className="text-muted-foreground">/10</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        Exploit History Score
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Past security incidents
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-lg font-bold ${getScoreColor(
                          scorecard.factors.exploitHistoryScore,
                          10
                        )}`}
                      >
                        {scorecard.factors.exploitHistoryScore}
                      </span>
                      <span className="text-muted-foreground">/10</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Recommendations */}
              <div>
                <h4 className="font-semibold mb-3">Recommendations</h4>
                <ul className="space-y-2">
                  {scorecard.recommendations.map((rec, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="text-yellow-600">⚠️</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Button */}
          <Button
            onClick={compareProtocols}
            disabled={comparing}
            variant="outline"
            className="w-full"
          >
            {comparing
              ? "Comparing..."
              : "Compare with Similar Protocols"}
          </Button>
        </>
      )}

      {/* Comparison Results */}
      {comparisonResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Protocol Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {comparisonResults.map((result, index) => (
                <Card
                  key={result.protocolName}
                  className={
                    result.protocolName === selectedProtocol
                      ? "border-2 border-primary"
                      : ""
                  }
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold text-muted-foreground">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">
                            {result.protocolName}
                          </div>
                          <Badge
                            className={`${getRatingColor(
                              result.rating
                            )} text-white mt-1`}
                            variant="secondary"
                          >
                            {result.rating}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">
                          {result.overallScore}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          /100
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Audit:</span>{" "}
                        <span className="font-semibold">
                          {result.factors.auditScore}/30
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">TVL:</span>{" "}
                        <span className="font-semibold">
                          {result.factors.tvlScore}/20
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Team:</span>{" "}
                        <span className="font-semibold">
                          {result.factors.teamScore}/15
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
