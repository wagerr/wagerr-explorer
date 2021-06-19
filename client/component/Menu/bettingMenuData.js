
export function generateBettingMenu(events) {
    
    let sports = [
      { id: 1, label: 'All Events', href: 'allevent', count: 0 },
      { id: 2, label: 'Soccer', href: 'soccer', count: 0 },
      { id: 3, label: 'Esports', href: 'esport', count: 0 },
      { id: 4, label: 'Baseball', href: 'baseball', count: 0 },
      { id: 5, label: 'Basketball', href: 'basketball', count: 0 },
      { id: 6, label: 'Football', href: 'football', count: 0 },
      { id: 7, label: 'Hockey', href: 'hockey', count: 0 },
      { id: 8, label: 'Aussie Rules', href: 'aussie_rules', count: 0 },
      { id: 9, label: 'Cricket', href: 'cricket', count: 0 },
      { id: 10, label: 'MMA', href: 'mma', count: 0 },
      { id: 11, label: 'Rugby League', href: 'rugby league', count: 0 },
      { id: 12, label: 'Rugby Union', href: 'rugby union', count: 0 },
    ]
      
      let counts = {};
      for (let e of events) {
        if (e.sport == "Mixed Martial Arts") {
          e.sport = "MMA";
        }
        if (counts[e.sport]) {
          counts[e.sport] += 1;
        } else {
          counts[e.sport] = 1;
        }

      }

      counts["All Events"] = events.length;

      for (let s of sports) {
        s.count = counts[s.label]
      }

      return sports
    }
