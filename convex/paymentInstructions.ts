export interface PaymentMethod {
  id: string;
  title: string;
  buttonLabel: string;
  copyableCode?: string;
  copyableLabel?: string;
  steps: string[];
  selarUrl?: string;
}

export interface CountryInstruction {
  type: "stk" | "manual" | "selar" | "coming_soon";
  methods: PaymentMethod[];
}

export const PAYMENT_INSTRUCTIONS: Record<string, CountryInstruction> = {
  KE: {
    type: "stk",
    methods: [],
  },
  UG: {
    type: "manual",
    methods: [
      {
        id: "airtel",
        title: "PAY WITH AIRTEL UGANDA",
        buttonLabel: "Pay with AIRTEL",
        copyableCode: "7235184",
        copyableLabel: "ID",
        steps: [
          "Dial *185*9# on your Airtel SIM",
          "Put ID: 7235184",
          "Enter Amount: UGX 19,496",
          "Reference: Enter your username reference",
          "Confirm it is LUXTECH MANAGEMENT",
          "Input your PIN & confirm",
        ],
      },
      {
        id: "mtn",
        title: "PAY WITH MTN UGANDA",
        buttonLabel: "Pay with MTN",
        copyableCode: "0754168057",
        copyableLabel: "Number",
        steps: [
          "Dial *165# on your MTN SIM card",
          "Select: 1. Send Money",
          "Select: 1. Mobile User",
          "Enter Number: 0754168057",
          "Enter Amount: UGX 19,300",
          "Reason: Enter your username as reason",
          "Confirm paying to Muguywa Gerald",
          "Enter your MTN PIN",
        ],
      },
    ],
  },
  MW: {
    type: "manual",
    methods: [
      {
        id: "tnm",
        title: "MALAWI TNM MPAMBA",
        buttonLabel: "Pay with TNM MPAMBA",
        copyableCode: "2029893",
        copyableLabel: "Agent Code",
        steps: [
          "Dial *444#",
          "Select 3 - Cashout",
          "Select 1 - Agent",
          "Agent Code: 2029893 (Name: Rhodrick Boyson)",
          "Enter Amount: 12,800 MWK",
          "Confirm with PIN",
        ],
      },
      {
        id: "airtel",
        title: "MALAWI AIRTEL MONEY",
        buttonLabel: "Pay with Airtel Money",
        copyableCode: "480855",
        copyableLabel: "Agent Code",
        steps: [
          "Dial *211#",
          "Select 4 - Withdraw from agent",
          "Agent code: 480855 (Names: Benson Jaihloss)",
          "Enter Amount: 12,800 MWK",
          "Confirm with PIN",
        ],
      },
    ],
  },
  TZ: {
    type: "manual",
    methods: [
      {
        id: "tigo",
        title: "Tanzania Tigo Pesa",
        buttonLabel: "Pay with Tigo Pesa",
        copyableCode: "255782449063",
        copyableLabel: "Number",
        steps: [
          "Piga *150*01# kufungua menyu kuu ya Tigo Pesa",
          "Chagua 1 – Tuma kwenda namba ya simu (AIRTEL)",
          "Weka namba ya simu: 255782449063 (SHABANI OMARI BAHATI)",
          "Weka kiasi cha TZS 11,000",
          "Weka PIN yako kukamilisha malipo",
        ],
      },
      {
        id: "vodacom",
        title: "Tanzania Vodacom M-Pesa",
        buttonLabel: "Pay with Vodacom",
        copyableCode: "255782449063",
        copyableLabel: "Number",
        steps: [
          "Piga *150*00# kufungua menyu kuu ya Vodacom",
          "Chagua 1 – Tuma kwenda namba ya simu (AIRTEL)",
          "Weka namba ya simu: 255782449063 (SHABANI OMARI BAHATI)",
          "Weka kiasi cha TZS 11,000",
          "Weka PIN yako kukamilisha malipo",
        ],
      },
      {
        id: "airtel",
        title: "Tanzania Airtel Money",
        buttonLabel: "Pay with Airtel Money",
        copyableCode: "255782449063",
        copyableLabel: "Number",
        steps: [
          "Piga *150*60# kwenye laini yako ya Airtel",
          "Chagua 1 – Tuma kwenda Namba ya Simu (AIRTEL)",
          "Weka namba ya simu: 255782449063 (SHABANI OMARI BAHATI)",
          "Weka kiasi cha TZS 11,000",
          "Weka PIN yako kukamilisha malipo",
        ],
      },
      {
        id: "halotel",
        title: "Tanzania Halotel",
        buttonLabel: "Pay with Halotel",
        copyableCode: "255782449063",
        copyableLabel: "Number",
        steps: [
          "Piga *150*88# kufungua menyu kuu ya Halotel",
          "Chagua 1 – Tuma kwenda namba ya simu (AIRTEL)",
          "Weka namba ya simu: 255782449063 (SHABANI OMARI BAHATI)",
          "Weka kiasi cha TZS 11,000",
          "Weka PIN yako kukamilisha malipo",
        ],
      },
    ],
  },
  ZM: {
    type: "manual",
    methods: [
      {
        id: "mtn",
        title: "PAY WITH MTN ZAMBIA",
        buttonLabel: "Pay with MTN",
        copyableCode: "254117659509",
        copyableLabel: "Number",
        steps: [
          "Dial *115# on your MTN SIM",
          "Select Send Money",
          "Select International Transfer",
          "Select Kenya",
          "Enter Number: 254117659509",
          "Enter Amount: ZMW 130",
          "Confirm it is Denis kilei Mbaika",
          "Enter PIN",
        ],
      },
      {
        id: "airtel",
        title: "PAY WITH AIRTEL ZAMBIA",
        buttonLabel: "Pay with Airtel",
        copyableCode: "254117659509",
        copyableLabel: "Number",
        steps: [
          "Dial *115# on your Airtel SIM",
          "Select Send Money",
          "Select International Transfer",
          "Select Kenya",
          "Enter Number: 254117659509",
          "Enter Amount: ZMW 130",
          "Confirm it is Denis kilei Mbaika",
          "Enter PIN",
        ],
      },
    ],
  },
  SS: {
    type: "manual",
    methods: [
      {
        id: "mtn",
        title: "PAY WITH MTN SOUTH SUDAN",
        buttonLabel: "Pay with MTN MoMo",
        copyableCode: "256754168057",
        copyableLabel: "Number",
        steps: [
          "Dial *200*1*3# on your MTN South Sudan phone",
          "Access the MoMo menu and select 'Send Money'",
          "Select 'International Transfer' then 'Uganda'",
          "Enter recipient's AIRTEL number: 256754168057",
          "Enter the amount: 20000 SSP",
          "Confirm names: Muguywa Gerald",
          "Enter your PIN to confirm the transaction",
        ],
      },
    ],
  },
  BW: {
    type: "manual",
    methods: [
      {
        id: "orange",
        title: "PAY WITH ORANGE BOTSWANA",
        buttonLabel: "Pay with Orange Money",
        copyableCode: "256754168057",
        copyableLabel: "Number",
        steps: [
          "Dial *145# on your SIM",
          "Select 2 – Orange Money Transactions",
          "Select 2 – International Money Transfer",
          "Select 4 – Uganda (MTN & Airtel)",
          "Number to send to: 256754168057",
          "Confirm it is Muguywa Gerald",
          "Enter Amount: BWP 95",
          "Enter your PIN to confirm",
        ],
      },
    ],
  },
  GH: {
    type: "selar",
    methods: [
      {
        id: "selar",
        title: "Pay via Selar (Ghana)",
        buttonLabel: "Pay with Mobile Money / Card",
        selarUrl: "https://selar.com/qo87t1s221?currency=GHS",
        steps: [],
      },
    ],
  },
  NG: {
    type: "selar",
    methods: [
      {
        id: "selar",
        title: "Pay via Selar (Nigeria)",
        buttonLabel: "Pay with Bank Transfer / Card",
        selarUrl: "https://selar.com/qo87t1s221?currency=NGN",
        steps: [],
      },
    ],
  },
  INT: {
    type: "manual",
    methods: [
      {
        id: "binance",
        title: "PAY VIA BINANCE",
        buttonLabel: "Pay with Binance",
        copyableCode: "PENDING_BINANCE_PAY_ID",
        copyableLabel: "Binance Pay ID",
        steps: [
          "Open your Binance App",
          "Go to Binance Pay",
          "Select 'Send' and choose Pay ID",
          "Enter Pay ID: (Pending)",
          "Enter the equivalent USD amount",
          "Confirm the payment",
        ],
      },
    ],
  },
  CM: {
    type: "coming_soon",
    methods: [],
  },
  RW: {
    type: "coming_soon",
    methods: [],
  },
};