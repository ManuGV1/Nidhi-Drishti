# -*- coding: utf-8 -*-
rupee = '\u20B9'

content = (
    "import React, { useEffect, useState } from 'react';\n"
    "import { apiService } from '../api/client';\n"
    "import { IndiaMap } from '../components/common/IndiaMap';\n"
    "import { CountUp } from '../components/common/CountUp';\n"
    "import { LoadingSpinner } from '../components/common/LoadingSpinner';\n"
    "import { ErrorAlert } from '../components/common/ErrorAlert';\n"
    "import { RiskBadge } from '../components/common/RiskBadge';\n"
    "import { WorkIntelligenceModal } from '../components/works/WorkIntelligenceModal';\n"
    "import { GeographicDrilldownDrawer } from '../components/geography/GeographicDrilldownDrawer';\n"
    "import {\n"
    "  Compass, RefreshCw, ArrowRight, Sparkles, ShieldAlert,\n"
    "  FileCheck, Clock, Building2\n"
    "} from 'lucide-react';\n"
    "import { useNavigate } from 'react-router-dom';\n"
    "\n"
    "export const CommandCenterPage = () => {\n"
    "  const [overview, setOverview] = useState(null);\n"
    "  const [priorityRisks, setPriorityRisks] = useState([]);\n"
    "  const [states, setStates] = useState([]);\n"
    "  const [enrichedStates, setEnrichedStates] = useState([]);\n"
    "  const [selectedState, setSelectedState] = useState(null);\n"
    "  const [mapMode, setMapMode] = useState('ALLOCATION');\n"
    "  const [selectedWorkItem, setSelectedWorkItem] = useState(null);\n"
    "  const [loading, setLoading] = useState(true);\n"
    "  const [error, setError] = useState(null);\n"
    "  const navigate = useNavigate();\n"
)

with open('d:/NidhiDristi/_part1.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("part1 ok len=" + str(len(content)))