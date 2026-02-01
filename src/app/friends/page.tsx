"use client";

export default function FriendsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 px-4 py-8 font-mono">
      {/* Incoming Requests */}
      <section>
        <h2 className="text-base text-primary mb-3">
          Incoming Requests
        </h2>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-secondary border-b border-secondary border-opacity-20">
              <td className="py-2">user</td>
              <td className="py-2">date</td>
              <td className="py-2"></td>
            </tr>
          </thead>
          <tbody>
            <tr className="text-secondary text-center">
              <td colSpan={3} className="py-6">
                No incoming requests.
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Friends */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base text-primary">Friends</h2>
          <button className="px-3 py-1.5 rounded text-xs bg-primary text-background transition-all duration-150 hover:scale-105 active:scale-95">
            add friend
          </button>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-secondary border-b border-secondary border-opacity-20">
              <td className="py-2">name</td>
              <td className="py-2">friends for</td>
              <td className="py-2">level</td>
              <td className="py-2">tests</td>
              <td className="py-2">time typing</td>
              <td className="py-2">streak</td>
              <td className="py-2">time 15 pb</td>
              <td className="py-2">time 60 pb</td>
              <td className="py-2"></td>
            </tr>
          </thead>
          <tbody>
            <tr className="text-secondary text-center">
              <td colSpan={9} className="py-8">
                {"You don't have any friends :("}
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
