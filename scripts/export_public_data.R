#!/usr/bin/env Rscript
# =============================================================================
# PUBLIC EXPORT | PEDIATRIC AML NMF BRIDGE EXPLORER
# =============================================================================
# Converts existing private Script 08 / 13B / optional 13C + 11D results into
# group-level summaries for an entirely static GitHub Pages website.
# COMPLETE TESTED ANALYSIS EXPORT: NO EXTRA 2x2 SMALL-CELL CENSORSHIP.
# Only associations actually tested by 13B with finite BH-adjusted P and
# matched 13B bridge-arm counts are exported. This does NOT export USIs,
# patient-level clinical records, beta values, or CpG IDs.
# IMPORTANT: Rare-event subgroup counts/proportions are included; assess
# reuse permissions for ALL linked clinical annotations before public release.
# The site is its own repository; edit paths below before running locally.
# =============================================================================

# ----- 01. EDIT PATHS ON YOUR COMPUTER --------------------------------------
PROJECT_DIR <- Sys.getenv("NMF_PROJECT_DIR", unset="C:/Users/reida/Documents/Aim_4/20260916_NMF/NMF_molecular_bridges/")
# The EXTRACTED WEBSITE REPOSITORY folder, not the main NMF data project.
# AUTO-DETECT website root from scripts/export_public_data.R (RStudio Source or Rscript).
# Set NMF_BRIDGE_REPO_DIR explicitly only if you launch this script from elsewhere.
find_repo <- function() {
  opts <- character()
  args <- commandArgs(trailingOnly = FALSE)
  script_args <- sub("^--file=", "", grep("^--file=", args, value = TRUE))
  opts <- c(opts, script_args)
  frames <- sys.frames()
  for (frame in frames) {
    if (exists("ofile", envir = frame, inherits = FALSE)) {
      z <- get("ofile", envir = frame, inherits = FALSE)
      if (is.character(z) && length(z) == 1L) opts <- c(opts,z)
    }
  }
  if (length(opts)) for (q in rev(unique(opts))) {
    if (nzchar(q) && file.exists(q) && basename(q) == "export_public_data.R") {
      candidate <- normalizePath(file.path(dirname(q),".."),mustWork = FALSE)
      if (file.exists(file.path(candidate,"index.html"))) return(candidate)
    }
  }
  candidates <- unique(c(
    getwd(), file.path(getwd(),"Pediatric_AML_Bridge_Explorer_COMPLETE"),
    file.path(PROJECT_DIR,"Pediatric_AML_Bridge_Explorer_COMPLETE"),
    file.path(PROJECT_DIR,"Pediatric_AML_Bridge_Explorer"),
    file.path(PROJECT_DIR,"Pediatric_AML_Bridge_Explorer_GitHub_Ready","Pediatric_AML_Bridge_Explorer")
  ))
  found <- candidates[file.exists(file.path(candidates,"index.html"))]
  if(length(found)) return(normalizePath(found[1L],mustWork=TRUE))
  stop("Could not locate explorer website. Set NMF_BRIDGE_REPO_DIR to the folder containing index.html")
}
# If auto-detection fails, paste the path to your NEW extracted website here.
# Example: "C:/Users/reida/Documents/Aim_4/20260916_NMF/NMF_molecular_bridges/Pediatric_AML_Bridge_Explorer_COMPLETE"
PUBLIC_REPO_DIR_OVERRIDE <- ""
PUBLIC_REPO_DIR <- Sys.getenv("NMF_BRIDGE_REPO_DIR", unset=PUBLIC_REPO_DIR_OVERRIDE)
if (!nzchar(PUBLIC_REPO_DIR)) PUBLIC_REPO_DIR <- find_repo()
cat("Website repository: ",PUBLIC_REPO_DIR,"\n",sep="")
RESULTS <- file.path(PROJECT_DIR, "Results")
FILE_08 <- file.path(RESULTS, "08_Comprehensive_All_CpG_Molecular_Patient_Map",
   "Objects", "08_Comprehensive_All_CpG_Molecular_Patient_Map_Objects.rds")
FILE_13B <- file.path(RESULTS, "13B_Clinical_H_Bridge_Atlas", "Tables",
   "Table_13B_03_Clinical_Directional_Associations_FDR.csv")
FILE_COUNTS <- file.path(RESULTS, "13B_Clinical_H_Bridge_Atlas", "Tables",
   "Table_13B_02_All_Directional_Bridge_Sample_Counts.csv")
FILE_13C <- file.path(RESULTS, "13C_Clinical_CpG_Bridge_Integration", "Tables",
   "Table_13C_02_Clinical_Directional_CpG_Integrated_Atlas.csv")
FILE_13C_GENES <- file.path(RESULTS, "13C_Clinical_CpG_Bridge_Integration", "Tables",
   "Table_13C_07_Priority_Direction_Nearest_Gene_Lookup.csv")
FILE_13C_REGIONS <- file.path(RESULTS, "13C_Clinical_CpG_Bridge_Integration", "Tables",
   "Table_13C_06_GRCh38_Genomic_Region_Context_Descriptive.csv")
FILE_11D <- file.path(RESULTS, "11D_Pair_Specific_Molecular_Identity_Conservation",
   "Tables", "Table_11D_C_ALL_Selected_CpG_Direction_Associations.csv")

# Original primary-group clinical and pairwise-survival annotations are shipped
# separately as data/original-group-annotations.js, precomputed from the two
# uploaded source CSVs. This exporter NEVER overwrites that file.

MIN_PUBLIC_BRIDGE <- 5L
MIN_PUBLIC_NONBRIDGE <- 5L
# IMPORTANT: Previously an EXTRA publication suppression required all four
# categorical 2x2 cells to contain >=5 patients. That was NOT part of Script 13B
# and is deliberately REMOVED here; tested rare-event results are retained.
GROUP_Q_CUTOFF <- 0.05
SMALL_PRIMARY_COUNT_SUPPRESSION <- 5L  # no public exact values 1..4
MAX_NEAREST_GENES <- 8L
EXPECTED_N <- 854L
# Script 13B determines which associations were tested. The public UI uses
# FDR_Within_Population (same family as Fig_13B_B). It also shows FDR_Overall.

# ----- 02. LOGGING AND HELPERS ----------------------------------------------
if (!dir.exists(PUBLIC_REPO_DIR))
  stop("PUBLIC_REPO_DIR does not exist: ", PUBLIC_REPO_DIR,
       "\nExtract the website archive first, then edit the path in SECTION 01.")
if (!file.exists(file.path(PUBLIC_REPO_DIR,"index.html")))
  stop("PUBLIC_REPO_DIR must contain the explorer's index.html")
if (!requireNamespace("jsonlite",quietly=TRUE))
  stop("Please install jsonlite: install.packages('jsonlite')")
for (p in c(FILE_08,FILE_13B,FILE_COUNTS))
  if (!file.exists(p)) stop("Required upstream file is missing: ",p)
log_file <- file.path(PUBLIC_REPO_DIR,"export-local.log")
logline <- function(...) {
  s <- paste0("[", format(Sys.time(),"%Y-%m-%d %H:%M:%S"), "] ",paste0(...,collapse=""))
  cat(s,"\n");cat(s,"\n",file=log_file,append=TRUE)
}
need <- function(z,fields,source) {
  miss <- setdiff(fields,names(z))
  if(length(miss))stop(source," missing columns: ",paste(miss,collapse=", "))
}
rd <- function(path)utils::read.csv(path,check.names=FALSE,stringsAsFactors=FALSE)
valid_id <- function(z) is.character(z) && grepl("^nmf([1-9]|1[0-9]|2[0-3])$",z)
number <- function(z) {
  x <- suppressWarnings(as.numeric(z))
  x[!is.finite(x)] <- NA_real_
  x
}
flag <- function(z) !is.na(z)&tolower(trimws(as.character(z))) %in% c("true","t","1","yes")
make_pair <- function(a,b) paste0(a,"__to__",b)
identifiers <- paste0("nmf",1:23)

# ----- 03. LOAD ORIGINAL 23 GROUPS ------------------------------------------
logline("Read Script 08 original assignments (only aggregate counts exported)")
s08 <- readRDS(FILE_08)
need(s08$All_Patients,c("USI","Primary_Group"),"Script 08 All_Patients")
ids <- as.character(s08$All_Patients$USI)
primary <- as.character(s08$All_Patients$Primary_Group)
if(length(ids)!=EXPECTED_N||anyNA(ids)||anyDuplicated(ids)||anyNA(primary))
  stop("Invalid original USIs/primary assignments in Script 08")
if(any(!primary %in% identifiers))stop("Unexpected primary NMF group label")
groupcounts <- table(factor(primary,levels=identifiers))
nodes <- lapply(identifiers,function(g) {
  n <- as.integer(groupcounts[[g]])
  list(id=g,primaryPatients=if(n>0&&n<SMALL_PRIMARY_COUNT_SUPPRESSION) NA_integer_ else n,
       groupStats=list())
})
rm(s08,ids,primary)

# ----- 04. LOAD GROUP-DIRECTION COUNTS / PUBLIC SUPPRESSION -----------------
logline("Read 13B directional sample counts")
counts <- rd(FILE_COUNTS)
need(counts,c("Pair_Key","Source","Target","Population",
              "N_Source","N_Bridge","N_NonBridge"),"13B direction counts")
counts <- counts[counts$Source %in% identifiers & counts$Target %in% identifiers &
   counts$Source!=counts$Target & counts$Population %in% c("All","Female","Male"),,drop=FALSE]
if(anyDuplicated(counts[,c("Pair_Key","Population")]))
  stop("Duplicate Pair_Key / Population in 13B counts")
if(any(make_pair(counts$Source,counts$Target)!=counts$Pair_Key))
  stop("13B counts have inconsistent Pair_Key")
for(nm in c("N_Source","N_Bridge","N_NonBridge"))counts[[nm]] <- number(counts[[nm]])
if(any(!is.finite(counts$N_Source)|!is.finite(counts$N_Bridge)|
       !is.finite(counts$N_NonBridge)))stop("Missing numeric patient-count fields")
if(any(counts$N_Bridge+counts$N_NonBridge!=counts$N_Source))
  stop("13B patient counts do not sum to source group size")
# Only publish tested arms with at least the minimum count, even if 13B has
# ineligible direction rows in the complete private audit.
counts <- counts[counts$N_Bridge>=MIN_PUBLIC_BRIDGE &
   counts$N_NonBridge>=MIN_PUBLIC_NONBRIDGE,,drop=FALSE]
counts_pub <- lapply(seq_len(nrow(counts)),function(i) {
  z <- counts[i,]
  list(source=z$Source,target=z$Target,population=z$Population,
       nSource=as.integer(z$N_Source),nBridge=as.integer(z$N_Bridge),
       nNonBridge=as.integer(z$N_NonBridge))
})
logline("Public eligible directed-pair/population count rows: ",length(counts_pub))

# ----- 05. LOAD TESTED CLINICAL ASSOCIATIONS --------------------------------
clin <- rd(FILE_13B)
need(clin,c("Pair_Key","Source","Target","Population","Feature","Level",
          "Feature_Type","Status","Effect_Bridge_Minus_NonBridge",
          "Effect_Unit","FDR_Within_Population","FDR_Overall","P_Primary",
          "N_Bridge","N_NonBridge","N_Source","Primary_Test",
          "Pct_Bridge","Pct_NonBridge"),"13B clinical associations")
if(any(as.character(clin$Feature) %in% c("Final.Risk.Group","Final_Risk_Group")))
  stop("Forbidden risk variable in 13B table: only 1031 protocol risk")
if (any(clin$Feature == "Protocol_Risk", na.rm = TRUE)) {
  logline("Verified public risk feature: 1031 protocol (13B Feature=Protocol_Risk)")
} else {
  logline("No protocol 1031 risk clinical tests found (not silently substituted)")
}
clin <- clin[clin$Status=="tested" &
  clin$Source %in% identifiers & clin$Target %in% identifiers &
  clin$Population %in% c("All","Female","Male"),,drop=FALSE]
clin$Q <- number(clin$FDR_Within_Population)
clin$Effect <- number(clin$Effect_Bridge_Minus_NonBridge)
clin <- clin[is.finite(clin$Q)&clin$Q>=0&clin$Q<=1&is.finite(clin$Effect),,drop=FALSE]
allowed_pairs <- paste(counts$Pair_Key,counts$Population,sep="||")
clin <- clin[paste(clin$Pair_Key,clin$Population,sep="||") %in% allowed_pairs,,drop=FALSE]
# COMPLETE PUBLIC RESEARCH SUMMARY (no extra 2x2 cell censorship)
# Script 13B already enforced MIN_BRIDGE_PATIENTS=5 and
# MIN_NONBRIDGE_PATIENTS=5, and only "tested" results with finite BH FDR are
# kept. We do not silently drop statistically tested clinical characteristics
# merely because a mutation/fusion is rare in one subgroup.
# This retains exact numeric group-level counts and fractions, including
# potentially small cells. Public release requires checking source permissions.
logline("Complete 13B tested clinical association rows retained (no extra 2x2 suppression): ",nrow(clin))
logline("  With pooled BH q <= 0.05: ",sum(clin$Q[clin$Population=="All"]<=0.05,na.rm=TRUE))
logline("  With female BH q <= 0.05: ",sum(clin$Q[clin$Population=="Female"]<=0.05,na.rm=TRUE))
logline("  With male BH q <= 0.05: ",sum(clin$Q[clin$Population=="Male"]<=0.05,na.rm=TRUE))
logline("  Distinct pooled source→target directions at q <= 0.05: ",
  length(unique(clin$Pair_Key[clin$Population=="All" & clin$Q<=0.05])))
if(nrow(clin) && any(make_pair(clin$Source,clin$Target)!=clin$Pair_Key))
  stop("13B clinical association Pair_Key mismatch")
if(nrow(clin) && anyDuplicated(clin[,c("Pair_Key","Population","Feature","Level")]))
  stop("Duplicate source/target/population/feature/level clinical tests. Audit before public export")
# Confirm each association's source counts match 13B direction count record.
idx <- match(paste(clin$Pair_Key,clin$Population,sep="||"),allowed_pairs)
if(nrow(clin) && any(is.na(idx)))stop("Unmatched 13B clinical comparison")
if(nrow(clin) && any(number(clin$N_Bridge)!=counts$N_Bridge[idx]|
                    number(clin$N_NonBridge)!=counts$N_NonBridge[idx]))
  stop("13B association arm counts disagree with 13B directional count table")
family <- function(f) {
  if(f=="Sex")return("Sex")
  if(f=="Protocol_Risk")return("Protocol 1031 risk")
  if(f%in%c("Age","AgeGroup"))return("Age")
  if(f%in%c("M6_AML","M7_AML"))return("Phenotype")
  if(f%in%c("FLT3_ITD","WT1","NPM","CEBPA","Mutations_Category"))return("Mutation")
  if(f=="Primary_Fusion")return("Fusion")
  if(f%in%c("t_8_21","t_9_11","inv_16","del5q","Trisomy21","MLL","Primary_Cytogenetics"))
    return("Cytogenetics")
  "Other"
}
edges <- lapply(seq_len(nrow(clin)),function(i) {
  z <- clin[i,,drop=FALSE]
  list(source=z$Source,target=z$Target,population=z$Population,
       feature=z$Feature,level=z$Level,family=family(z$Feature),
       effect=as.numeric(z$Effect),unit=z$Effect_Unit,
       q=as.numeric(z$Q),qGlobal=number(z$FDR_Overall),
       p=number(z$P_Primary),
       nSource=as.integer(z$N_Source),nBridge=as.integer(z$N_Bridge),
       nNonBridge=as.integer(z$N_NonBridge),
       nBridgeLevel=if("N_Bridge_Level" %in% names(z))number(z$N_Bridge_Level) else NA_real_,
       nNonBridgeLevel=if("N_NonBridge_Level" %in% names(z))number(z$N_NonBridge_Level) else NA_real_,
       pBridge=number(z$Pct_Bridge),pNonBridge=number(z$Pct_NonBridge),
       incomingMedian=if(z$Feature_Type=="continuous")number(z$Pct_Bridge) else NA_real_,
       nonIncomingMedian=if(z$Feature_Type=="continuous")number(z$Pct_NonBridge) else NA_real_,
       primaryTest=z$Primary_Test,status=z$Status)
})
logline("Full clinical association edges exported: ",length(edges))

# ----- 06. OPTIONAL DIRECTED CpG SUMMARIES, NOT CLINICAL CpG TESTS ---------
cpg <- list()
if(file.exists(FILE_13C)) {
  logline("Loading precomputed 13C directional CpG counts")
  z <- rd(FILE_13C)
  need(z,c("Pair_Key","Population","N_Unique_CpGs","N_PrimaryOnly",
           "N_ConservedOnly","N_Both_PrimaryAndConserved","N_Neither_Label"),
       "13C clinical directional CpG atlas")
  z <- z[z$Population=="All" & !duplicated(z$Pair_Key),,drop=FALSE]
  cpg <- lapply(seq_len(nrow(z)),function(i) {
    q <- z[i,]
    list(pair=q$Pair_Key,
      nUnique=number(q$N_Unique_CpGs),nPrimaryOnly=number(q$N_PrimaryOnly),
      nConservedOnly=number(q$N_ConservedOnly),
      nBoth=number(q$N_Both_PrimaryAndConserved),
      nNeither=number(q$N_Neither_Label),genes=list(),regions=list())
  })
} else if(file.exists(FILE_11D)) {
  logline("13C not available; building limited CpG summaries from 11D")
  z <- rd(FILE_11D)
  need(z,c("CpG","Source","Target","Primary_Restricted","Neighborhood_Conserved"),"11D catalogue")
  z <- z[!is.na(z$CpG)&nzchar(trimws(as.character(z$CpG))) &
    z$Source %in% identifiers & z$Target %in% identifiers,,drop=FALSE]
  z$Pair_Key <- make_pair(z$Source,z$Target)
  sp <- split(seq_len(nrow(z)),z$Pair_Key)
  cpg <- lapply(names(sp),function(k) {
    q <- z[sp[[k]],,drop=FALSE]
    ids <- unique(q$CpG)
    pri <- unique(q$CpG[flag(q$Primary_Restricted)])
    cons <- unique(q$CpG[flag(q$Neighborhood_Conserved)])
    list(pair=k,nUnique=length(ids),nPrimaryOnly=length(setdiff(pri,cons)),
      nConservedOnly=length(setdiff(cons,pri)),
      nBoth=length(intersect(pri,cons)),nNeither=length(setdiff(ids,union(pri,cons))),
      genes=list(),regions=list())
  })
} else logline("Neither 13C nor 11D CpG summary available. CpG sidebar will say unavailable")
if(length(cpg)) {
  pairs <- vapply(cpg,function(z)z$pair,character(1))
  if(anyDuplicated(pairs))stop("Duplicate CpG pairs in 13C output")
  if(file.exists(FILE_13C_GENES)) {
    genes <- rd(FILE_13C_GENES)
    need(genes,c("Pair_Key","Gene","N_Unique_Directional_CpGs"),"13C gene lookup")
    for(i in seq_along(cpg)) {
      q <- genes[genes$Pair_Key==cpg[[i]]$pair,,drop=FALSE]
      if(nrow(q)) {
        q <- q[order(-number(q$N_Unique_Directional_CpGs)),,drop=FALSE]
        q <- head(q,MAX_NEAREST_GENES)
        cpg[[i]]$genes <- lapply(seq_len(nrow(q)),function(j)
          list(gene=as.character(q$Gene[j]),n=number(q$N_Unique_Directional_CpGs[j])))
      }
    }
  }
  if(file.exists(FILE_13C_REGIONS)) {
    regions <- rd(FILE_13C_REGIONS)
    need(regions,c("Pair_Key","Region","N_Unique_CpGs"),"13C region counts")
    for(i in seq_along(cpg)) {
      q <- regions[regions$Pair_Key==cpg[[i]]$pair,,drop=FALSE]
      cpg[[i]]$regions <- lapply(seq_len(nrow(q)),function(j)
        list(region=as.character(q$Region[j]),n=number(q$N_Unique_CpGs[j])))
    }
  }
}
logline("Public directional CpG summary pairs: ",length(cpg))

# ----- 07. ORIGINAL PRIMARY-GROUP ANNOTATIONS ----------------------------
# These are precomputed separately. No directional 13B clinical test is reused
# as an original NMF-group one-vs-all association.
if (file.exists(file.path(PUBLIC_REPO_DIR,"data","original-group-annotations.js"))) {
  logline("Preserving precomputed original one-vs-all + pairwise survival node annotations")
} else {
  logline("WARNING: original-group-annotations.js absent; nodes show no original annotations")
}

# ----- 07b. OPTIONAL ORIGINAL-ASSIGNMENT KM FIGURES --------------------------
# Files are copied into the PUBLIC website only after explicit local selection.
# No survival effect sizes are computed or attributed to 13B bridges.
copy_km <- function(from,to_basename) {
  if(!nzchar(from)) return(NA_character_)
  if(!file.exists(from))stop("Selected KM plot does not exist: ",from)
  ext <- tolower(tools::file_ext(from))
  if(!ext %in% c("png","jpg","jpeg","svg","pdf"))
    stop("KM plot must be png/jpg/jpeg/svg/pdf: ",from)
  dest_dir <- file.path(PUBLIC_REPO_DIR,"assets","km")
  dir.create(dest_dir,recursive=TRUE,showWarnings=FALSE)
  dest <- file.path(dest_dir,paste0(to_basename,".",ext))
  if(!file.copy(from,dest,overwrite=TRUE))stop("Cannot copy KM plot: ",from)
  paste0("assets/km/",basename(dest))
}
km_overview <- if(nzchar(KM_OVERVIEW_FILE))copy_km(KM_OVERVIEW_FILE,"original_NMF_KM_overview") else NA_character_
km_groups <- list()
if(nzchar(KM_GROUP_PLOTS_DIR)) {
 if(!dir.exists(KM_GROUP_PLOTS_DIR))stop("KM_GROUP_PLOTS_DIR not found: ",KM_GROUP_PLOTS_DIR)
 for(g in identifiers){
  options <- unlist(lapply(c("png","jpg","jpeg","svg","pdf"),function(ext)
    file.path(KM_GROUP_PLOTS_DIR,paste0(g,".",ext))),use.names=FALSE)
  hits <- options[file.exists(options)]
  if(length(hits)>1L)stop("Multiple KM files for ",g,": choose one extension")
  if(length(hits)==1L)km_groups[[g]] <- copy_km(hits[1L],paste0(g,"_original_KM"))
 }
}
km <- list(overview=if(is.na(km_overview))NULL else km_overview,groups=km_groups)
logline("Original-assignment KM figures copied: overview=",!is.na(km_overview),
        "; individual groups=",length(km_groups))

# ----- 08. PUBLIC EXPORT / SECURITY CHECK -----------------------------------
out <- list(
  meta=list(mode="research",description="Exploratory in-sample direction-level clinical comparisons",
    cohort=EXPECTED_N,source="13B + optional 13C / 11D; 08 original assignments",
    riskColumn="Risk.group.classification..by.protocol.1031",
    primaryGroupAssignmentsRefitted=FALSE,
    fdrFamily="13B FDR_Within_Population (BH within All/Female/Male)",
    releasePolicy="complete Script 13B tested clinical associations; no additional 2x2 cell-size censoring",
    cpgNote="11D candidate CpGs are not individually tested against clinical covariates"),
  nodes=nodes,edges=edges,cpg=cpg,counts=counts_pub,km=km)
json <- jsonlite::toJSON(out,auto_unbox=TRUE,pretty=TRUE,na="null",null="null",digits=8)
if(grepl('"USI"|"Patient_ID"|"Sample_ID"|"CpG_ID"',json,perl=TRUE))
  stop("SECURITY: unexpected patient/CpG identifier key in public JSON")
# Export only a top-level JS assignment so file:// preview works without fetch.
outfile <- file.path(PUBLIC_REPO_DIR,"data","network-data.js")
dir.create(dirname(outfile),recursive=TRUE,showWarnings=FALSE)
writeLines(c("/* AGGREGATE RESEARCH DATA. Generated locally; no patient IDs or CpG IDs. */",
             paste0("window.NMF_BRIDGE_DATA = ",json,";")),outfile,useBytes=TRUE)
size <- file.info(outfile)$size
logline("SUCCESS — aggregate public JS data: ",outfile," | ",format(size,big.mark=",")," bytes")
logline("SUMMARY — nodes: ",length(nodes),"; tested clinical associations: ",
        length(edges),"; eligible directed pair/population rows: ",length(counts_pub),
        "; CpG-pair summaries: ",length(cpg))
logline("RELEASE — no USI/CpG IDs or beta matrix exported; exact small aggregate clinical cells MAY be present")
logline("NEXT — review permissions for linked clinical metadata; inspect site; publish only group-level JS")
