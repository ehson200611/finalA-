"use client";

import { useTheme } from "next-themes";
import { ArrowRight, Target, CheckCircle, BookOpen } from "lucide-react";
import Link from "next/link";
import SectionOne from "@/components/SectionOne";
import { useTranslations } from "next-intl";
import Errors from "@/components/error/errors";
import { useEffect, useState } from "react";
import { useGetMeProfileQuery } from "@/store/slices/profile";
import Loading from "@/components/loading/loading";
import { useGetQuestionA1Query } from "@/store/slices/testApi";

// Material UI компонентҳо
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Box,
  Typography,
  Paper,
  useMediaQuery,
} from '@mui/material';
import { styled, useTheme as useMuiTheme } from '@mui/material/styles';

const colors = [
  "from-green-400 to-green-500",
  "from-blue-400 to-blue-500",
  "from-yellow-400 to-yellow-500",
  "from-orange-400 to-orange-500",
  "from-red-400 to-red-500",
  "from-purple-400 to-purple-500",
];

const hrefs = [
  "/test/a1",
  "/test/a2",
  "/test/b1",
  "/test/b2",
  "/test/c1",
  "/test/c2",
];

// Styled компонент барои Material UI
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    padding: theme.spacing(1),
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(145deg, #033445 0%, #02202B 100%)'
      : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 20px 60px rgba(0, 0, 0, 0.5)'
      : '0 20px 60px rgba(0, 107, 146, 0.2)',
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
  color: 'white',
  fontWeight: 600,
  padding: '12px 24px',
  borderRadius: '12px',
  textTransform: 'none',
  fontSize: '16px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 20px rgba(33, 150, 243, 0.3)',
  },
}));

const OutlineButton = styled(Button)(({ theme }) => ({
  border: `2px solid ${theme.palette.mode === 'dark' ? '#37474F' : '#E0E0E0'}`,
  color: theme.palette.mode === 'dark' ? '#E0E0E0' : '#37474F',
  fontWeight: 600,
  padding: '12px 24px',
  borderRadius: '12px',
  textTransform: 'none',
  fontSize: '16px',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.mode === 'dark' ? '#2196F3' : '#1976D2',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(25, 118, 210, 0.04)',
  },
}));

const AuthModal = ({ open, onClose }) => {
  const t = useTranslations("testPage");
  const muiTheme = useMuiTheme();
  const fullScreen = useMediaQuery(muiTheme.breakpoints.down('sm'));

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            fontWeight: 700,
            background: muiTheme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #64B5F6 0%, #81C784 100%)'
              : 'linear-gradient(135deg, #1976D2 0%, #388E3C 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          {t("loginRequired")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("loginRequiredMessage")}
        </Typography>
      </DialogTitle>
      
      <DialogActions sx={{ p: 3, pt: 0, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Link href="/login" passHref style={{ textDecoration: 'none', flex: 1, width: '100%' }}>
          <GradientButton fullWidth onClick={onClose}>
            {t("login")}
          </GradientButton>
        </Link>
        
        <Link href="/register" passHref style={{ textDecoration: 'none', flex: 1, width: '100%' }}>
          <OutlineButton fullWidth onClick={onClose}>
            {t("register")}
          </OutlineButton>
        </Link>
        
        <Button
          onClick={onClose}
          sx={{
            color: muiTheme.palette.text.secondary,
            textTransform: 'none',
            width: { xs: '100%', sm: 'auto' },
            mt: { xs: 1, sm: 0 },
          }}
        >
          {t("cancel")}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default function TestPage() {
  const { theme } = useTheme();
  const t = useTranslations("testPage");
  const { data: testData, error, isLoading } = useGetQuestionA1Query();
  const { data: userData } = useGetMeProfileQuery();
  
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const steps = [t("changeLevel"), t("answerQuestion"), t("getDetail")];

  const levels = [
    { id: "A1", name: t("a1"), desc: t("baseFraz") },
    { id: "A2", name: t("a2"), desc: t("theme") },
    { id: "B1", name: t("b1"), desc: t("themeBro") },
    { id: "B2", name: t("b2"), desc: t("hurdText") },
    { id: "C1", name: t("c1"), desc: t("old") },
    { id: "C2", name: t("c2"), desc: t("understand") },
  ];

  const handleStartTest = (href, e) => {
    if (!userData) {
      e.preventDefault();
      setShowModal(true);
    }
  };

  if (!mounted) return null;

  if (error) {
    return (
      <Errors
        error={error}
        onRetry={() => window.location.reload()}
        fullScreen
      />
    );
  }

  if (isLoading) return <Loading />;

  return (
    <main
      className={`${
        theme === "dark"
          ? "bg-[#0a1a23] text-white"
          : "bg-linear-to-br from-[#e6f9ff] via-[#f4fbfc] to-[#e8f7f9] text-[#02202B]"
      } font-sans min-h-screen`}
    >
      <div className="lg:max-w-[1280px] lg:mx-auto mx-5 py-5">
        {/* Hero */}
        <SectionOne title={t("level")} description={t("yourLevel")} />

        {/* HOW IT WORKS */}
        <section className="py-16 px-6 text-center">
          <h2 className="text-3xl font-bold mb-10">{t("howItWork")}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`p-8 rounded-lg shadow-md hover:shadow-xl transition duration-300 ${
                  theme === "dark" ? "bg-[#094e68]" : "bg-white"
                }`}
              >
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-linear-to-r from-blue-500 to-sky-400">
                  {index === 0 && <Target className="w-8 h-8 text-white" />}
                  {index === 1 && (
                    <CheckCircle className="w-8 h-8 text-white" />
                  )}
                  {index === 2 && <BookOpen className="w-8 h-8 text-white" />}
                </div>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* LEVELS */}
        <section className="py-16 px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              {t("chooseLevel")}
            </h2>
            <p className="text-xs sm:text-base">{t("change")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {levels.map((lvl, i) => (
              <div
                key={lvl.id}
                className={`flex flex-col justify-between h-full rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 border overflow-hidden ${
                  theme === "dark"
                    ? "bg-[#033445] border-gray-700"
                    : "bg-white border-gray-100"
                }`}
              >
                <div
                  className={`p-6 max-h-[17vh] text-white bg-linear-to-r ${colors[i]}`}
                >
                  <h3 className="font-bold">{lvl.name}</h3>
                  <p className="text-sm">{lvl.desc}</p>
                </div>

                <Link
                  href={hrefs[i]}
                  onClick={(e) => handleStartTest(hrefs[i], e)}
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
                    theme === "dark"
                      ? "bg-white/10 text-white hover:bg-white/20"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {t("startTest")}
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Material UI Modal барои корбарони вориднашуда */}
      <AuthModal
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </main>
  );
}