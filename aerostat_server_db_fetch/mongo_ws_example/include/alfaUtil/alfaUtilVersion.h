#ifndef __VERSION_H__
#define __VERSION_H__

#ifdef __cplusplus
extern "C" {
#endif

#define BUILD_DATE 1739010614
#define MAJOR 1
#define MINOR 0
#define BATCH 0

#define STRINGIFY(x) #x
#define TOSTRING(x) STRINGIFY(x)

#define VERSION_STR TOSTRING(MAJOR) "." TOSTRING(MINOR) "." TOSTRING(BATCH)

#define DEVELOPER "maaz@esparkconsultants.com"
#define COMPILE_TIME "Sat Feb 08  3:30:14 PM PST 2025"
#define CURRENT_BRANCH "fe-be-staging-v1.0.0"
#define COMMIT_HASH "d826f47484ea2eb4db0a3cc9ff1eab4f9d8afad3"

#ifdef __cplusplus
}
#endif

#endif // __VERSION_H__
