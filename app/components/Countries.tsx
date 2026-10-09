"use client";

const countries = [
  { code: "KE", name: "Kenya", dial: "254", currency: "KES" },
  { code: "MW", name: "Malawi", dial: "265", currency: "MWK" },
  { code: "ZM", name: "Zambia", dial: "260", currency: "ZMW" },
  { code: "UG", name: "Uganda", dial: "256", currency: "UGX" },
  { code: "NG", name: "Nigeria", dial: "234", currency: "NGN" },
  { code: "TZ", name: "Tanzania", dial: "255", currency: "TZS" },
  { code: "BW", name: "Botswana", dial: "267", currency: "BWP" },
  { code: "CM", name: "Cameroon", dial: "237", currency: "XAF" },
  { code: "GH", name: "Ghana", dial: "233", currency: "GHS" },
  { code: "BI", name: "Burundi", dial: "257", currency: "BIF" },
  { code: "RW", name: "Rwanda", dial: "250", currency: "RWF" },
  { code: "CD", name: "DR Congo", dial: "243", currency: "CDF" },
  { code: "SS", name: "South Sudan", dial: "211", currency: "SSP" },
];

export default function Countries() {
  return (
    <section id="countries" className="relative bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h2 className="text-3xl font-extrabold text-brand-900 sm:text-4xl">
          Supported Countries
        </h2>
        <p className="mt-3 text-base font-medium text-brand-500">
          Join thousands of earners across Africa. Find your country below.
        </p>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {countries.map((country) => (
            <div
              key={country.code}
              className="group flex flex-col items-center justify-center rounded-xl bg-[#f4f7fb] p-6 transition-all hover:shadow-md"
            >
              {/* Flag Image via CDN */}
              <img
                src={`https://flagcdn.com/${country.code.toLowerCase()}.svg`}
                alt={`${country.name} flag`}
                className="mb-4 h-10 w-14 rounded object-cover shadow-sm transition-transform group-hover:scale-110"
                loading="lazy"
              />
              <span className="text-sm font-bold text-gray-900">
                {country.name}
              </span>
              <span className="mt-1 text-xs font-medium text-gray-500">
                +{country.dial} • {country.currency}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}