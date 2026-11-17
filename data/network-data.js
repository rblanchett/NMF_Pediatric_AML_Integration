/* DEMONSTRATION DATA: fabricated values for interface testing ONLY. Replace by running scripts/export_public_data.R. */
window.NMF_BRIDGE_DATA = {
  "meta": {
    "mode": "demo",
    "label": "ILLUSTRATIVE DEMO — NOT SCIENTIFIC RESULTS",
    "cohort": 854,
    "source": "UI design fixtures only; delete by running exporter",
    "riskColumn": "Risk.group.classification..by.protocol.1031"
  },
  "nodes": [
    {
      "id": "nmf1",
      "primaryPatients": 0,
      "groupStats": []
    },
    {
      "id": "nmf2",
      "primaryPatients": 0,
      "groupStats": []
    },
    {
      "id": "nmf3",
      "primaryPatients": null,
      "groupStats": []
    },
    {
      "id": "nmf4",
      "primaryPatients": null,
      "groupStats": []
    },
    {
      "id": "nmf5",
      "primaryPatients": null,
      "groupStats": [
        {
          "feature": "Example lesion",
          "level": "positive",
          "direction": "enriched",
          "q": 0.003,
          "population": "All"
        },
        {
          "feature": "Example risk category",
          "level": "high",
          "direction": "depleted",
          "q": 0.012,
          "population": "All"
        }
      ]
    },
    {
      "id": "nmf6",
      "primaryPatients": null,
      "groupStats": []
    },
    {
      "id": "nmf7",
      "primaryPatients": null,
      "groupStats": []
    },
    {
      "id": "nmf8",
      "primaryPatients": null,
      "groupStats": [
        {
          "feature": "Example fusion",
          "level": "present",
          "direction": "enriched",
          "q": 0.002,
          "population": "All"
        }
      ]
    },
    {
      "id": "nmf9",
      "primaryPatients": null,
      "groupStats": []
    },
    {
      "id": "nmf10",
      "primaryPatients": null,
      "groupStats": []
    },
    {
      "id": "nmf11",
      "primaryPatients": null,
      "groupStats": []
    },
    {
      "id": "nmf12",
      "primaryPatients": null,
      "groupStats": []
    },
    {
      "id": "nmf13",
      "primaryPatients": null,
      "groupStats": []
    },
    {
      "id": "nmf14",
      "primaryPatients": null,
      "groupStats": []
    },
    {
      "id": "nmf15",
      "primaryPatients": null,
      "groupStats": []
    },
    {
      "id": "nmf16",
      "primaryPatients": null,
      "groupStats": []
    },
    {
      "id": "nmf17",
      "primaryPatients": null,
      "groupStats": []
    },
    {
      "id": "nmf18",
      "primaryPatients": null,
      "groupStats": []
    },
    {
      "id": "nmf19",
      "primaryPatients": null,
      "groupStats": []
    },
    {
      "id": "nmf20",
      "primaryPatients": null,
      "groupStats": []
    },
    {
      "id": "nmf21",
      "primaryPatients": null,
      "groupStats": []
    },
    {
      "id": "nmf22",
      "primaryPatients": null,
      "groupStats": []
    },
    {
      "id": "nmf23",
      "primaryPatients": null,
      "groupStats": []
    }
  ],
  "edges": [
    {
      "source": "nmf5",
      "target": "nmf23",
      "population": "All",
      "feature": "FLT3_ITD",
      "level": "Present",
      "family": "Mutation",
      "effect": 0.22,
      "unit": "prevalence_difference",
      "q": 0.002,
      "qGlobal": 0.01,
      "p": 0.001,
      "nSource": 53,
      "nBridge": 14,
      "nNonBridge": 39,
      "nBridgeLevel": 9,
      "nNonBridgeLevel": 18,
      "pBridge": 0.67,
      "pNonBridge": 0.45,
      "primaryTest": "EXAMPLE only",
      "status": "tested"
    },
    {
      "source": "nmf5",
      "target": "nmf23",
      "population": "All",
      "feature": "Protocol_Risk",
      "level": "High risk",
      "family": "Protocol 1031 risk",
      "effect": -0.12,
      "unit": "prevalence_difference",
      "q": 0.012,
      "qGlobal": 0.02,
      "p": 0.006,
      "nSource": 53,
      "nBridge": 14,
      "nNonBridge": 39,
      "nBridgeLevel": 5,
      "nNonBridgeLevel": 18,
      "pBridge": 0.33,
      "pNonBridge": 0.45,
      "primaryTest": "EXAMPLE only",
      "status": "tested"
    },
    {
      "source": "nmf23",
      "target": "nmf5",
      "population": "All",
      "feature": "Primary_Fusion",
      "level": "EXAMPLE",
      "family": "Fusion",
      "effect": 0.16,
      "unit": "prevalence_difference",
      "q": 0.017,
      "qGlobal": 0.025,
      "p": 0.0085,
      "nSource": 25,
      "nBridge": 11,
      "nNonBridge": 14,
      "nBridgeLevel": 7,
      "nNonBridgeLevel": 6,
      "pBridge": 0.61,
      "pNonBridge": 0.45,
      "primaryTest": "EXAMPLE only",
      "status": "tested"
    },
    {
      "source": "nmf6",
      "target": "nmf8",
      "population": "All",
      "feature": "M7_AML",
      "level": "Present",
      "family": "Phenotype",
      "effect": 0.26,
      "unit": "prevalence_difference",
      "q": 0.001,
      "qGlobal": 0.009000000000000001,
      "p": 0.0005,
      "nSource": 51,
      "nBridge": 9,
      "nNonBridge": 42,
      "nBridgeLevel": 6,
      "nNonBridgeLevel": 19,
      "pBridge": 0.71,
      "pNonBridge": 0.45,
      "primaryTest": "EXAMPLE only",
      "status": "tested"
    },
    {
      "source": "nmf8",
      "target": "nmf6",
      "population": "All",
      "feature": "t_8_21",
      "level": "Present",
      "family": "Cytogenetics",
      "effect": 0.18,
      "unit": "prevalence_difference",
      "q": 0.013,
      "qGlobal": 0.020999999999999998,
      "p": 0.0065,
      "nSource": 45,
      "nBridge": 12,
      "nNonBridge": 33,
      "nBridgeLevel": 8,
      "nNonBridgeLevel": 15,
      "pBridge": 0.63,
      "pNonBridge": 0.45,
      "primaryTest": "EXAMPLE only",
      "status": "tested"
    },
    {
      "source": "nmf5",
      "target": "nmf19",
      "population": "All",
      "feature": "AgeGroup",
      "level": "Infant",
      "family": "Age",
      "effect": -0.14,
      "unit": "prevalence_difference",
      "q": 0.022,
      "qGlobal": 0.03,
      "p": 0.011,
      "nSource": 53,
      "nBridge": 13,
      "nNonBridge": 40,
      "nBridgeLevel": 4,
      "nNonBridgeLevel": 18,
      "pBridge": 0.31,
      "pNonBridge": 0.45,
      "primaryTest": "EXAMPLE only",
      "status": "tested"
    },
    {
      "source": "nmf6",
      "target": "nmf17",
      "population": "All",
      "feature": "Protocol_Risk",
      "level": "High risk",
      "family": "Protocol 1031 risk",
      "effect": 0.15,
      "unit": "prevalence_difference",
      "q": 0.031,
      "qGlobal": 0.039,
      "p": 0.0155,
      "nSource": 51,
      "nBridge": 9,
      "nNonBridge": 42,
      "nBridgeLevel": 5,
      "nNonBridgeLevel": 19,
      "pBridge": 0.6,
      "pNonBridge": 0.45,
      "primaryTest": "EXAMPLE only",
      "status": "tested"
    },
    {
      "source": "nmf7",
      "target": "nmf15",
      "population": "All",
      "feature": "FLT3_ITD",
      "level": "Present",
      "family": "Mutation",
      "effect": 0.23,
      "unit": "prevalence_difference",
      "q": 0.009,
      "qGlobal": 0.017,
      "p": 0.0045,
      "nSource": 48,
      "nBridge": 18,
      "nNonBridge": 30,
      "nBridgeLevel": 12,
      "nNonBridgeLevel": 14,
      "pBridge": 0.68,
      "pNonBridge": 0.45,
      "primaryTest": "EXAMPLE only",
      "status": "tested"
    },
    {
      "source": "nmf10",
      "target": "nmf13",
      "population": "All",
      "feature": "NPM",
      "level": "Present",
      "family": "Mutation",
      "effect": 0.19,
      "unit": "prevalence_difference",
      "q": 0.028,
      "qGlobal": 0.036000000000000004,
      "p": 0.014,
      "nSource": 32,
      "nBridge": 11,
      "nNonBridge": 21,
      "nBridgeLevel": 7,
      "nNonBridgeLevel": 9,
      "pBridge": 0.64,
      "pNonBridge": 0.45,
      "primaryTest": "EXAMPLE only",
      "status": "tested"
    },
    {
      "source": "nmf11",
      "target": "nmf20",
      "population": "All",
      "feature": "M6_AML",
      "level": "Present",
      "family": "Phenotype",
      "effect": -0.18,
      "unit": "prevalence_difference",
      "q": 0.041,
      "qGlobal": 0.049,
      "p": 0.0205,
      "nSource": 49,
      "nBridge": 16,
      "nNonBridge": 33,
      "nBridgeLevel": 4,
      "nNonBridgeLevel": 15,
      "pBridge": 0.27,
      "pNonBridge": 0.45,
      "primaryTest": "EXAMPLE only",
      "status": "tested"
    },
    {
      "source": "nmf17",
      "target": "nmf21",
      "population": "All",
      "feature": "Sex",
      "level": "Female",
      "family": "Sex",
      "effect": 0.16,
      "unit": "prevalence_difference",
      "q": 0.025,
      "qGlobal": 0.033,
      "p": 0.0125,
      "nSource": 19,
      "nBridge": 9,
      "nNonBridge": 10,
      "nBridgeLevel": 5,
      "nNonBridgeLevel": 4,
      "pBridge": 0.61,
      "pNonBridge": 0.45,
      "primaryTest": "EXAMPLE only",
      "status": "tested"
    },
    {
      "source": "nmf13",
      "target": "nmf22",
      "population": "All",
      "feature": "CEBPA",
      "level": "Present",
      "family": "Mutation",
      "effect": 0.21,
      "unit": "prevalence_difference",
      "q": 0.007,
      "qGlobal": 0.015,
      "p": 0.0035,
      "nSource": 23,
      "nBridge": 6,
      "nNonBridge": 17,
      "nBridgeLevel": 4,
      "nNonBridgeLevel": 8,
      "pBridge": 0.66,
      "pNonBridge": 0.45,
      "primaryTest": "EXAMPLE only",
      "status": "tested"
    },
    {
      "source": "nmf4",
      "target": "nmf12",
      "population": "All",
      "feature": "Primary_Cytogenetics",
      "level": "EXAMPLE",
      "family": "Cytogenetics",
      "effect": -0.2,
      "unit": "prevalence_difference",
      "q": 0.034,
      "qGlobal": 0.042,
      "p": 0.017,
      "nSource": 21,
      "nBridge": 10,
      "nNonBridge": 11,
      "nBridgeLevel": 2,
      "nNonBridgeLevel": 5,
      "pBridge": 0.25,
      "pNonBridge": 0.45,
      "primaryTest": "EXAMPLE only",
      "status": "tested"
    },
    {
      "source": "nmf3",
      "target": "nmf9",
      "population": "All",
      "feature": "M7_AML",
      "level": "Present",
      "family": "Phenotype",
      "effect": 0.15,
      "unit": "prevalence_difference",
      "q": 0.022,
      "qGlobal": 0.03,
      "p": 0.011,
      "nSource": 23,
      "nBridge": 11,
      "nNonBridge": 12,
      "nBridgeLevel": 7,
      "nNonBridgeLevel": 5,
      "pBridge": 0.6,
      "pNonBridge": 0.45,
      "primaryTest": "EXAMPLE only",
      "status": "tested"
    },
    {
      "source": "nmf14",
      "target": "nmf19",
      "population": "All",
      "feature": "Protocol_Risk",
      "level": "Low risk",
      "family": "Protocol 1031 risk",
      "effect": -0.17,
      "unit": "prevalence_difference",
      "q": 0.02,
      "qGlobal": 0.028,
      "p": 0.01,
      "nSource": 31,
      "nBridge": 10,
      "nNonBridge": 21,
      "nBridgeLevel": 3,
      "nNonBridgeLevel": 9,
      "pBridge": 0.28,
      "pNonBridge": 0.45,
      "primaryTest": "EXAMPLE only",
      "status": "tested"
    }
  ],
  "cpg": [
    {
      "pair": "nmf5__to__nmf23",
      "source": "nmf5",
      "target": "nmf23",
      "nUnique": 566,
      "nPrimaryOnly": 114,
      "nConservedOnly": 189,
      "nBoth": 64,
      "nNeither": 0,
      "genes": [
        {
          "gene": "Example gene A",
          "n": 18
        },
        {
          "gene": "Example gene B",
          "n": 11
        }
      ],
      "regions": [
        {
          "region": "Promoter",
          "n": 82
        },
        {
          "region": "Gene body",
          "n": 119
        },
        {
          "region": "Intergenic",
          "n": 101
        }
      ]
    },
    {
      "pair": "nmf23__to__nmf5",
      "source": "nmf23",
      "target": "nmf5",
      "nUnique": 509,
      "nPrimaryOnly": 111,
      "nConservedOnly": 164,
      "nBoth": 61,
      "nNeither": 0,
      "genes": [
        {
          "gene": "Example gene A",
          "n": 18
        },
        {
          "gene": "Example gene B",
          "n": 11
        }
      ],
      "regions": [
        {
          "region": "Promoter",
          "n": 82
        },
        {
          "region": "Gene body",
          "n": 119
        },
        {
          "region": "Intergenic",
          "n": 101
        }
      ]
    },
    {
      "pair": "nmf6__to__nmf8",
      "source": "nmf6",
      "target": "nmf8",
      "nUnique": 471,
      "nPrimaryOnly": 109,
      "nConservedOnly": 192,
      "nBoth": 59,
      "nNeither": 0,
      "genes": [
        {
          "gene": "Example gene A",
          "n": 18
        },
        {
          "gene": "Example gene B",
          "n": 11
        }
      ],
      "regions": [
        {
          "region": "Promoter",
          "n": 82
        },
        {
          "region": "Gene body",
          "n": 119
        },
        {
          "region": "Intergenic",
          "n": 101
        }
      ]
    },
    {
      "pair": "nmf8__to__nmf6",
      "source": "nmf8",
      "target": "nmf6",
      "nUnique": 528,
      "nPrimaryOnly": 112,
      "nConservedOnly": 183,
      "nBoth": 62,
      "nNeither": 0,
      "genes": [
        {
          "gene": "Example gene A",
          "n": 18
        },
        {
          "gene": "Example gene B",
          "n": 11
        }
      ],
      "regions": [
        {
          "region": "Promoter",
          "n": 82
        },
        {
          "region": "Gene body",
          "n": 119
        },
        {
          "region": "Intergenic",
          "n": 101
        }
      ]
    },
    {
      "pair": "nmf5__to__nmf19",
      "source": "nmf5",
      "target": "nmf19",
      "nUnique": 547,
      "nPrimaryOnly": 113,
      "nConservedOnly": 190,
      "nBoth": 63,
      "nNeither": 0,
      "genes": [
        {
          "gene": "Example gene A",
          "n": 18
        },
        {
          "gene": "Example gene B",
          "n": 11
        }
      ],
      "regions": [
        {
          "region": "Promoter",
          "n": 82
        },
        {
          "region": "Gene body",
          "n": 119
        },
        {
          "region": "Intergenic",
          "n": 101
        }
      ]
    },
    {
      "pair": "nmf6__to__nmf17",
      "source": "nmf6",
      "target": "nmf17",
      "nUnique": 471,
      "nPrimaryOnly": 109,
      "nConservedOnly": 192,
      "nBoth": 59,
      "nNeither": 0,
      "genes": [
        {
          "gene": "Example gene A",
          "n": 18
        },
        {
          "gene": "Example gene B",
          "n": 11
        }
      ],
      "regions": [
        {
          "region": "Promoter",
          "n": 82
        },
        {
          "region": "Gene body",
          "n": 119
        },
        {
          "region": "Intergenic",
          "n": 101
        }
      ]
    },
    {
      "pair": "nmf7__to__nmf15",
      "source": "nmf7",
      "target": "nmf15",
      "nUnique": 642,
      "nPrimaryOnly": 118,
      "nConservedOnly": 180,
      "nBoth": 68,
      "nNeither": 0,
      "genes": [
        {
          "gene": "Example gene A",
          "n": 18
        },
        {
          "gene": "Example gene B",
          "n": 11
        }
      ],
      "regions": [
        {
          "region": "Promoter",
          "n": 82
        },
        {
          "region": "Gene body",
          "n": 119
        },
        {
          "region": "Intergenic",
          "n": 101
        }
      ]
    },
    {
      "pair": "nmf10__to__nmf13",
      "source": "nmf10",
      "target": "nmf13",
      "nUnique": 509,
      "nPrimaryOnly": 111,
      "nConservedOnly": 171,
      "nBoth": 61,
      "nNeither": 0,
      "genes": [
        {
          "gene": "Example gene A",
          "n": 18
        },
        {
          "gene": "Example gene B",
          "n": 11
        }
      ],
      "regions": [
        {
          "region": "Promoter",
          "n": 82
        },
        {
          "region": "Gene body",
          "n": 119
        },
        {
          "region": "Intergenic",
          "n": 101
        }
      ]
    },
    {
      "pair": "nmf11__to__nmf20",
      "source": "nmf11",
      "target": "nmf20",
      "nUnique": 604,
      "nPrimaryOnly": 116,
      "nConservedOnly": 183,
      "nBoth": 66,
      "nNeither": 0,
      "genes": [
        {
          "gene": "Example gene A",
          "n": 18
        },
        {
          "gene": "Example gene B",
          "n": 11
        }
      ],
      "regions": [
        {
          "region": "Promoter",
          "n": 82
        },
        {
          "region": "Gene body",
          "n": 119
        },
        {
          "region": "Intergenic",
          "n": 101
        }
      ]
    },
    {
      "pair": "nmf17__to__nmf21",
      "source": "nmf17",
      "target": "nmf21",
      "nUnique": 471,
      "nPrimaryOnly": 109,
      "nConservedOnly": 160,
      "nBoth": 59,
      "nNeither": 0,
      "genes": [
        {
          "gene": "Example gene A",
          "n": 18
        },
        {
          "gene": "Example gene B",
          "n": 11
        }
      ],
      "regions": [
        {
          "region": "Promoter",
          "n": 82
        },
        {
          "region": "Gene body",
          "n": 119
        },
        {
          "region": "Intergenic",
          "n": 101
        }
      ]
    },
    {
      "pair": "nmf13__to__nmf22",
      "source": "nmf13",
      "target": "nmf22",
      "nUnique": 414,
      "nPrimaryOnly": 106,
      "nConservedOnly": 167,
      "nBoth": 56,
      "nNeither": 0,
      "genes": [
        {
          "gene": "Example gene A",
          "n": 18
        },
        {
          "gene": "Example gene B",
          "n": 11
        }
      ],
      "regions": [
        {
          "region": "Promoter",
          "n": 82
        },
        {
          "region": "Gene body",
          "n": 119
        },
        {
          "region": "Intergenic",
          "n": 101
        }
      ]
    },
    {
      "pair": "nmf4__to__nmf12",
      "source": "nmf4",
      "target": "nmf12",
      "nUnique": 490,
      "nPrimaryOnly": 110,
      "nConservedOnly": 161,
      "nBoth": 60,
      "nNeither": 0,
      "genes": [
        {
          "gene": "Example gene A",
          "n": 18
        },
        {
          "gene": "Example gene B",
          "n": 11
        }
      ],
      "regions": [
        {
          "region": "Promoter",
          "n": 82
        },
        {
          "region": "Gene body",
          "n": 119
        },
        {
          "region": "Intergenic",
          "n": 101
        }
      ]
    },
    {
      "pair": "nmf3__to__nmf9",
      "source": "nmf3",
      "target": "nmf9",
      "nUnique": 509,
      "nPrimaryOnly": 111,
      "nConservedOnly": 162,
      "nBoth": 61,
      "nNeither": 0,
      "genes": [
        {
          "gene": "Example gene A",
          "n": 18
        },
        {
          "gene": "Example gene B",
          "n": 11
        }
      ],
      "regions": [
        {
          "region": "Promoter",
          "n": 82
        },
        {
          "region": "Gene body",
          "n": 119
        },
        {
          "region": "Intergenic",
          "n": 101
        }
      ]
    },
    {
      "pair": "nmf14__to__nmf19",
      "source": "nmf14",
      "target": "nmf19",
      "nUnique": 490,
      "nPrimaryOnly": 110,
      "nConservedOnly": 171,
      "nBoth": 60,
      "nNeither": 0,
      "genes": [
        {
          "gene": "Example gene A",
          "n": 18
        },
        {
          "gene": "Example gene B",
          "n": 11
        }
      ],
      "regions": [
        {
          "region": "Promoter",
          "n": 82
        },
        {
          "region": "Gene body",
          "n": 119
        },
        {
          "region": "Intergenic",
          "n": 101
        }
      ]
    }
  ],
  "counts": [
    {
      "source": "nmf5",
      "target": "nmf23",
      "population": "All",
      "nSource": 53,
      "nBridge": 14,
      "nNonBridge": 39
    },
    {
      "source": "nmf5",
      "target": "nmf23",
      "population": "All",
      "nSource": 53,
      "nBridge": 14,
      "nNonBridge": 39
    },
    {
      "source": "nmf23",
      "target": "nmf5",
      "population": "All",
      "nSource": 25,
      "nBridge": 11,
      "nNonBridge": 14
    },
    {
      "source": "nmf6",
      "target": "nmf8",
      "population": "All",
      "nSource": 51,
      "nBridge": 9,
      "nNonBridge": 42
    },
    {
      "source": "nmf8",
      "target": "nmf6",
      "population": "All",
      "nSource": 45,
      "nBridge": 12,
      "nNonBridge": 33
    },
    {
      "source": "nmf5",
      "target": "nmf19",
      "population": "All",
      "nSource": 53,
      "nBridge": 13,
      "nNonBridge": 40
    },
    {
      "source": "nmf6",
      "target": "nmf17",
      "population": "All",
      "nSource": 51,
      "nBridge": 9,
      "nNonBridge": 42
    },
    {
      "source": "nmf7",
      "target": "nmf15",
      "population": "All",
      "nSource": 48,
      "nBridge": 18,
      "nNonBridge": 30
    },
    {
      "source": "nmf10",
      "target": "nmf13",
      "population": "All",
      "nSource": 32,
      "nBridge": 11,
      "nNonBridge": 21
    },
    {
      "source": "nmf11",
      "target": "nmf20",
      "population": "All",
      "nSource": 49,
      "nBridge": 16,
      "nNonBridge": 33
    },
    {
      "source": "nmf17",
      "target": "nmf21",
      "population": "All",
      "nSource": 19,
      "nBridge": 9,
      "nNonBridge": 10
    },
    {
      "source": "nmf13",
      "target": "nmf22",
      "population": "All",
      "nSource": 23,
      "nBridge": 6,
      "nNonBridge": 17
    },
    {
      "source": "nmf4",
      "target": "nmf12",
      "population": "All",
      "nSource": 21,
      "nBridge": 10,
      "nNonBridge": 11
    },
    {
      "source": "nmf3",
      "target": "nmf9",
      "population": "All",
      "nSource": 23,
      "nBridge": 11,
      "nNonBridge": 12
    },
    {
      "source": "nmf14",
      "target": "nmf19",
      "population": "All",
      "nSource": 31,
      "nBridge": 10,
      "nNonBridge": 21
    }
  ]
};
