var pokelist = [
    ['Ivysaur', '002', '886', 'cloudy + sunny/clear', '1108', '1', 'no'],
    ['Charmeleon', '005', '847', 'sunny/clear', '1060', '1', 'no'],
    ['Wartortle', '008', '756', 'rainy', '945', '1', 'no'],
    ['Metapod', '011', '239', 'rainy', '299', '1', 'no'],
    ['Magicarp', '129', '125', 'rainy', '157', '1', 'yes'],    
    ['Snorunt', '361', '441', 'snow', '551', '1', 'yes'],
    ['Swablu', '333', '412', 'partly cloudy + windy', '516', '1', 'yes'],
    ['Wailmer', '320', '945', 'rainy', '1017', '1', 'no'], ///////////////  TIER 2
    ['Cloyster', '091', '1414', 'rainy + Snow', '1767', '2', 'no'],
    ['Electabuzz', '125', '1255', 'rainy', '1568', '2', 'no'],
    ['Exeggutor', '103', '1666', 'sunny + windy', '2083', '2', 'no'],
    ['Magneton', '082', '1278', 'rainy + Snow', '1598', '2', 'no'],
    ['Manetric', '310', '1217', 'rainy', '1522', '2', 'no'],
    ['Marowak', '105', '966', 'sunny', '1208', '2', 'no'],
    ['Mawile', '303', '848', 'Snow + cloudy', '1060', '2', 'yes'],
    ['Sableye', '302', '745', 'fog', '932', '2', 'no'],
    ['Sandslash', '028', '1330', 'sunny', '1663', '2', 'no'],
    ['Tentacruel', '073', '1356', 'rainy + cloudy', '1695', '2', 'no'],  ///////////////  TIER 3  
    ['Alakazam', '065', '1649', 'windy', '2062', '3', 'no'],
    ['Gengar', '094', '1496', 'fog + cloudy', '1870', '3', 'no'],
    ['Jinx', '124', '1435', 'windy + snow', '1794', '3', 'no'],
    ['Jolteon', '135', '1560', 'rainy', '1950', '3', 'no'],
    ['Machamp', '068', '1650', 'cloudy', '2063', '3', 'no'],
    ['Ninetales', '038', '1233', 'sunny/clear', '1541', '3', 'no'],
    ['Omastar', '139', '1534', 'rainy + partly cloudy', '1918', '3', 'no'],
    ['Piloswine', '221', '1305', 'sunny + snow', '1631', '3', 'no'],
    ['Porygon', '137', '895', 'partly cloudy', '1120', '3', 'no'],
    ['Scyther', '123', '1408', 'rainy + windy', '1760', '3', 'no'], ///////////////  TIER 4
    ['Absol', '359', '1303', 'fog', '1629', '4', 'yes'],
    ['Aggron', '306', '1716', 'partly cloudy + snow', '2145', '4', 'no'],
    ['Golem', '076', '1666', 'sunny + Partly cloudy', '2083', '4', 'no'],
    ['Lapras', '131', '1487', 'rainy', '1859', '4', 'no'],
    ['Lappie', '131', '1487', 'rainy', '1859', '4', 'no'],
    ['Nidoqueen', '031', '1336', 'sunny + cloudy', '1670', '4', 'no'],
    ['Nidoking', '034', '1363', 'sunny + cloudy', '1704', '4', 'no'],
    ['Poliwrath', '062', '1395', 'rainy + cloudy', '1744', '4', 'no'],
    ['Snorlax', '143', '1917', 'partly cloudy', '2396', '4', 'no'],
    ['Snor', '143', '1917', 'partly cloudy', '2396', '4', 'no'],
    ['Snorie', '143', '1917', 'partly cloudy', '2396', '4', 'no'],
    ['Snoro', '143', '1917', 'partly cloudy', '2396', '4', 'no'],
    ['Snorrie', '143', '1917', 'partly cloudy', '2396', '4', 'no'],
    ['Snorro', '143', '1917', 'partly cloudy', '2396', '4', 'no'],
    ['Tyranitar', '248', '2097', 'partly cloudy + fog', '2621', '4', 'no'],
    ['Tyra', '248', '2097', 'partly cloudy + fog', '2621', '4', 'no'],
    ['Victreebell', '071', '1296', 'sunny', '1620', '4', 'no'], ///////////////  TIER 5   
    ['Articuno', '144', '1676', 'snow + windy', '2095', '5', 'no'],
    ['Lugia', '249', '2056', 'windy', '2570', '5', 'yes'],
    ['Moltres', '146', '1870', 'sunny + windy', '2337', '5', 'no'],
    ['Zapdos', '145', '1902', 'rainy + windy', '2378', '5', 'no'],
    ['Entei', '244', '1930', 'sunny', '2412', '5', 'no'],
    ['Raicou', '243', '1913', 'rainy', '2392', '5', 'no'],
    ['Raikou', '243', '1913', 'rainy', '2392', '5', 'no'],
    ['Raicow','243', '1913', 'rainy', '2392', '5', 'no'],
    ['Raicu', '243', '1913', 'rainy', '2392', '5', 'no'],
    ['Suicune', '245', '1613', 'rainy', '2016', '5', 'no'],
    ['Suikune', '245', '1613', 'rainy', '2016', '5', 'no'],
    ['Sweekoen', '245', '1613', 'rainy', '2016', '5', 'no'],
    ['Mewtwo', '150', '2275', 'windy', '2844', '5', 'no'],
    ['Mewto', '150', '2275', 'windy', '2844', '5', 'no'],
    ['Ho-Ho', '250', '2222', 'sunny + windy', '2778', '5', 'no'],
    ['Ho-Oh', '250', '2222', 'sunny + windy', '2778', '5', 'no'],
    ['Ho-oh', '250', '2222', 'sunny + windy', '2778', '5', 'no'],
    ['Hooh', '250', '2222', 'sunny + windy', '2778', '5', 'no'],
    ['Oh-oh', '250', '2222', 'sunny + windy', '2778', '5', 'no'],
    ['Mew', '151', '1766', 'windy', '2207', '5', 'no'],
    ['Celebi', '251', '1766', 'sunny + windy', '2207', '5', 'no'],    
    ['Groudon', '383', '2328', 'sunny', '2910', '5', 'no'],
    ['Groundon', '383', '2328', 'sunny', '2910', '5', 'no'],    
    ['Kyogre', '382', '2328', 'rainy', '2910', '5', 'no'],
    ['Kyoger', '382', '2328', 'rainy', '2910', '5', 'no'],
    ['Rayquaza', '384', '2083', 'windy', '2604', '5', 'no'],
    ['Raykuaza', '384', '2083', 'windy', '2604', '5', 'no'],
    ['Raykaza', '384', '2083', 'windy', '2604', '5', 'no'],	
	['Latias', '380', '1929', 'windy', '2412', '5', 'no'],	
    ['Latios', '381', '2082', 'windy', '2603', '5', 'no'],	
    ['T5', '995', '0', '0', '0', '5', 'no'],  ///////////////  EGGS
    ['Tier5', '995', '0', '0', '0', '5', 'no'],
    ['T4', '994', '0', '0', '0', '4', 'no'],
    ['Tier4', '994', '0', '0', '0', '4', 'no'],
    ['T3', '993', '0', '0', '0', '3', 'no'],
    ['Tier3', '993', '0', '0', '0', '3', 'no'],
    ['T2', '992', '0', '0', '0', '2', 'no'],
    ['Tier2', '992', '0', '0', '0', '2', 'no'],
    ['T1', '991', '0', '0', '0', '1', 'no'],
    ['Tier1', '991', '0', '0', '0', '1', 'no']
];
 
exports.pokelist = pokelist;